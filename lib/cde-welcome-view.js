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

  getReactPngPath(){
    this.picPath = path.join(__dirname, '../picture')
    return this.picPath + "\\react.png"
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
            <center><img src={this.getAtomPngPath()} /></center>
            <h1 className='welcome-title'>
                <span style="color:blue;">Welcome to Lenovo CDE</span>
            </h1>
            <h4>
                <center>CDE is an open and Atom based front-end tool for cross-platform app development</center>
            </h4>
        </header>

        <section className='welcome-panel'>
            <center><p>For help, please view <a href="http://mobility.lenovo.com/index.html#/doc2">instructions</a> on Lenovo MADP</p></center>
            <p>
              <center><button ref='projectButton' onclick={this.didClickCreateProjectButton} className='btn btn-primary inline-block-tight icon icon-cloud-download'>
                &nbsp;&nbsp;&nbsp;&nbsp;Create a React Native Project
              </button></center>
            </p>
            <p>
              <center><button ref='projectButton' onclick={this.didClickProjectButton} className='btn btn-primary inline-block-tight icon icon-diff-added'>
                &nbsp;&nbsp;&nbsp;&nbsp;Add Project Folder&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </button></center>
            </p>
        </section>

        <section className='welcome-panel'>
            <center><input className='input-checkbox' type='checkbox' id='show-welcome-on-startup' checked={atom.config.get('cde-welcome.showOnStartup')} onchange={this.didChangeShowOnStartup} />
            <label for='show-welcome-on-startup'>Show Welcome Guide when opening CDE</label></center>
        </section>
    </div>
</div>
    )
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
