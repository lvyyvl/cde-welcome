/** @babel */
/** @jsx etch.dom */

import etch from 'etch'
import CreateNativeProjectView from './create-native-project-view'
import path from 'path'

export default class ActiveEditorInfoView {

  constructor(props) {
    this.props = props
    this.didClickProjectButton = this.didClickProjectButton.bind(this)
    this.didClickCreateProjectButton = this.didClickCreateProjectButton.bind(this)

    etch.initialize(this)

    this.element.addEventListener('click', (event) => {
      const link = event.target.closest('a')
      if (link && link.dataset.event) {
        this.props.reporterProxy.sendEvent(`clicked-cdewelcome-${link.dataset.event}-link`)
      }
    })
  }

  getAtomPngPath(){
    this.picPath = path.join(__dirname, '../picture')
    return this.picPath + "\\atom.png"
  }

  // Required: Update the component with new properties and children.
  update () {}

  // Required: The `render` method returns a virtual DOM tree representing the
  // current state of the component. Etch will call `render` to build and update
  // the component's associated DOM element. Babel is instructed to call the
  // `etch.dom` helper in compiled JSX expressions by the `@jsx` pragma above.
  render () {
    return (
      <div className='welcome'>
        <div className='welcome-container'>
          <header className='welcome-header'>
            <center>
              <img src={this.getAtomPngPath()} />
            </center>
            <h1 className='welcome-title'>
              <span style="color:blue;">Welcome to Lenovo CDE</span>
            </h1>
            <h4>
              <center>CDE is an Atom based front-end tool for cross-platform app development on Lenovo MADP</center>
            </h4>
            <h4>
              <center>联想MADP平台推出的一款基于Atom开源编辑器的跨平台移动应用开发前端工具</center>
            </h4>
          </header>

          <section className='welcome-panel'>
            <p>
              <center>For help, please view <a href="http://mobility.lenovo.com/index.html#/doc2">instructions (指导文档)</a> on Lenovo MADP</center>
            </p>

            <details className='welcome-card' {...this.getSectionProps('new')}>
              <summary className='welcome-summary icon icon-repo'>
                Start a <span className='welcome-highlight'>new</span> project
              </summary>
              <div className='welcome-detail'>
                <p>
                  Create a new React Native project in the new Atom window automatically. (在新窗口中自动创建一个新的React Native项目。)
                </p>
                <p>
                  <button ref='projectButton' onclick={this.didClickCreateProjectButton} className='btn btn-primary inline-block-tight'>
                    Create React Native Project
                  </button>
                </p>
              </div>
            </details>

            <details className='welcome-card' {...this.getSectionProps('project')}>
              <summary className='welcome-summary icon icon-file-directory'>
                Open an <span class='welcome-highlight'>existing</span> project
              </summary>
              <div className='welcome-detail'>
                <p>
                  You can open a folder as a project. Opening a folder will add a tree view to the editor
                  where you can browse all the files. (打开一个已有的项目文件夹。您将可以在左侧的项目资源浏览器中查看所有项目文件。)
                </p>
                <p>
                  <button ref='projectButton' onclick={this.didClickOpenFolderButton} className='btn btn-primary inline-block-tight'>
                    Open Folder in New Window
                  </button>
                  <button ref='projectButton' onclick={this.didClickProjectButton} className='btn btn-primary inline-block-tight'>
                    Add Folder in Current Window
                  </button>
                </p>
              </div>
            </details>
          </section>

          <section className='welcome-panel'>
            <center>
              <input className='input-checkbox' type='checkbox' id='show-welcome-on-startup' checked={atom.config.get('cde-welcome.showOnStartup')} onchange={this.didChangeShowOnStartup} />
              <label for='show-welcome-on-startup'>Show Welcome Guide when opening CDE</label>
            </center>
          </section>
        </div>
      </div>
    )
  }

  getSectionProps (sectionName) {
    const props = {dataset: {section: sectionName}, onclick: this.didExpandOrCollapseSection}
    if (this.props.openSections && this.props.openSections.indexOf(sectionName) !== -1) {
      props.open = true
    }
    return props
  }

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    // Used by Atom for tab text
    return 'CDE Welcome';
  }

  getURI() {
    // Used by Atom to identify the view when toggling.
    return this.props.uri
  }

  isEqual (other) {
    other instanceof ActiveEditorInfoView
  }

  serialize() {
    return {
      // This is used to look up the deserializer function. It can be any string, but it needs to be
      // unique across all packages!
      deserializer: 'cde-welcome/CdeWelcomeView',
      uri: this.props.uri
    }
  }

  didChangeShowOnStartup () {
    atom.config.set('welcome.showOnStartup', this.checked)
  }

  didClickOpenFolderButton () {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'application:open-folder')
  }

  didClickProjectButton () {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'application:add-project-folder')
  }

  didClickCreateProjectButton(){
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'CDE Welcome:Create React Native Project');
  }

  didChangeShowOnStartup () {
    atom.config.set('cde-welcome.showOnStartup', this.checked)
  }
}
