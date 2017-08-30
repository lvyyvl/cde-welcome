/** @babel */
/** @jsx etch.dom */
import path from 'path'
import _ from 'underscore-plus'
import {TextEditor, BufferedProcess, CompositeDisposable, Disposable, BufferedNodeProcess} from 'atom'
import fs from 'fs-plus'
import fsextra from 'fs-extra'
import temp from 'temp'
import atomLinter from 'atom-linter'
import messageModule from 'atom-message-panel'
import projectUtil from 'atom-project-util'
import ChildProcess from 'child_process'
import MyBufferedProcess from './MyBufferedProcess'

export default class CreateNativeProjectView {
  constructor() {
    this.disposeables = new CompositeDisposable

    this.element = document.createElement('div')
    this.element.classList.add('create-native-project');

    this.miniEditor = new TextEditor({mini:true})
    this.element.appendChild(this.miniEditor.element)

    this.error = document.createElement('div')
    this.error.classList.add('error')
    this.element.appendChild(this.error)

    this.message = document.createElement('div')
    this.message.classList.add('message')
    this.element.appendChild(this.message)

    this.disposeables.add(
      atom.commands.add('atom-workspace','CDE Welcome:Create React Native Project',() => this.attach())
    )
    this.disposeables.add(atom.commands.add(this.element,'core:confirm', () => this.confirm()))
    this.disposeables.add(atom.commands.add(this.element,'core:cancel',() => this.close()))

    blurHandler = () => {this.close()}
    this.miniEditor.element.addEventListener('blur',blurHandler)
    this.disposeables.add(
      new Disposable(
        () => {this.miniEditor.element.removeEventListener('bulur',blurHandler)}
      )
    )
  }

  destroy(){
    if(this.panel !== "undefined" && this.panel !== null){
      this.panel.destroy()
    }
    this.disposeables.dispose()
  }

  attach(){
    this.panel = atom.workspace.addModalPanel({item: this, visible: false})
    this.previouslyFocusedElement = document.activeElement
    this.panel.show()
    this.message.textContent = "Enter project save path"
    this.setPathText("RNApp")
    this.miniEditor.element.focus()
  }

  setPathText(placeholderName){
    packagesDirectory = this.getPackagesDirectory()
    this.miniEditor.setText(path.join(packagesDirectory, placeholderName))
    pathLength = this.miniEditor.getText().length
    endOfDirectoryIndex = pathLength - placeholderName.length
    this.miniEditor.setSelectedBufferRange([0, endOfDirectoryIndex])
  }

  getPackagesDirectory(){
    if(atom.config.get('core.projectHome') !== null){
      return atom.config.get('core.projectHome')
    } else if (process.env.ATOM_REPOS_HOME !== null) {
      return process.env.ATOM_REPOS_HOME
    } else if (path.join(fs.getHomeDirectory(), 'github') !== null) {
      return path.join(fs.getHomeDirectory(), 'github')
    }
  }

  close(){
    if(this.panel.isVisible()){
      this.panel.hide()
      // this.previouslyFocusedElement.focus()
    }
  }

  confirm(){
    if(this.validPackagePath()){
      this.createPackageFiles()
    }
  }

  validPackagePath(){
    if(fs.existsSync(this.getPackagePath())){
      this.error.textContent = "Path already exists at " + this.getPackagePath()
      this.error.style.display = 'block'
      return false
    } else {
      return true
    }
  }

  getPackagePath(){
    packagePath = fs.normalize(this.miniEditor.getText().trim())
    // packageName = _.dasherize(path.basename(packagePath))
    packageName = path.basename(packagePath)
    return path.join(path.dirname(packagePath), packageName)
  }

  getProjectPath(){
    packagePath = fs.normalize(this.miniEditor.getText().trim())
    return path.dirname(packagePath)
  }

  getPackageName(){
    packagePath = fs.normalize(this.miniEditor.getText().trim())
    // packageName = _.dasherize(path.basename(packagePath))
    packageName = path.basename(packagePath)
    return packageName
  }

  createPackageFiles(){
    projectPath = this.getProjectPath()
    packagePath = this.getPackagePath()
    packageName = this.getPackageName()

    this.showStateMessage()
    stdout = (output) => this.appendMessage(output)
    stderr = (output) => this.appendMessage(output)

    exit = () =>{
      // Change and add some native document
      this.addSomeFiles(packagePath)
      // this.changeSomeNativeFiles(packagePath)
      // Open Project
      atom.open({'pathsToOpen': [packagePath], 'newWindow': true})
      // projectUtil.switch([packagePath]);
    }

    const options = {
      encoding: 'utf8',
      timeout: 0,
      maxBuffer: 200 * 1024,
      killSignal: 'SIGTERM',
      cwd: null,
      env: null
    }

    // args = ['init', packageName]
    // this.runCommand('react-native', args, options, stdout, stderr, exit)
    fs.makeTreeSync(projectPath)
    this.runComplexCommand('cd /d ' + projectPath + ' & react-native init ' + packageName, options, stdout, stderr, exit)
    this.close()
  }

  addSomeFiles(packagePath){
    let documentFolderPath = path.join(__dirname, '../document/')
    // copy all document folder files to generate project folder first
    fs.copySync(documentFolderPath, packagePath)
  }

  changeSomeNativeFiles(packagePath){
    let filepath = path.join(packagePath, '.babelrc')
    fsextra.readJson(filepath, (err, packageObj) => {
        if(err){
          throw err;
          console.log(err)
        } else {
          packageObj.presets.push('flow')
          fsextra.writeJson(filepath, packageObj, (error) => {
            if (error){
              throw error;
              console.log(error)
            }
          })
        }
      })
  }

  showStateMessage(){
    MessagePanelView = messageModule.MessagePanelView,
    PlainMessageView = messageModule.PlainMessageView;

    this.messages = new MessagePanelView({
      title: 'DownLoad Project State',
      maxHeight:'200px',
      recentMessagesAtTop:true
    });
    this.messages.attach();
  }

  appendMessage(output){
    this.messages.add(new PlainMessageView({
      message: output,
      className: 'text-success'
    }));
  }

  runCommand(command, args, options, stdout, stderr, exit){
    new BufferedProcess({command, args, options, stdout, stderr, exit})
  }

  runComplexCommand(command, options, stdout, stderr, exit){
    new MyBufferedProcess({command, options, stdout, stderr, exit})
  }
}
