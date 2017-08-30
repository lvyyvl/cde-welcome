/** @babel */

import ActiveEditorInfoView from './cde-welcome-view';
import {CompositeDisposable, Disposable} from 'atom';
import ReporterProxy from './reporter-proxy'
import CreateNativeProjectView from './create-native-project-view'

let WelcomeView
const WELCOME_URI = 'atom://cde-welcome'

export default class CdeWelcome{

  constructor(){
    this.reporterProxy = new ReporterProxy()
  }

  async activate() {
    this.subscriptions = new CompositeDisposable()

    // init create native project view
    this.native = new CreateNativeProjectView()

    // Add an opener for our view.
    this.subscriptions.add(
      atom.workspace.addOpener(uri => {
        if (uri === WELCOME_URI) {
          return this.createWelcomeView({uri: WELCOME_URI})
        }
    }))

    this.subscriptions.add(
      // Register command that toggles this view
      atom.commands.add('atom-workspace', 'CDE Welcome:Show', () => this.show())
    )

    if (atom.config.get('cde-welcome.showOnStartup')) {
      await this.show()
      this.reporterProxy.sendEvent('show-on-initial-load')
    }
  }

  show() {
    return Promise.all([
      atom.workspace.open(WELCOME_URI, {split: 'left'})
    ])
  }

  consumeReporter (reporter) {
    return this.reporterProxy.setReporter(reporter)
  }

  deactivate() {
    this.subscriptions.dispose();
  }

  createWelcomeView (state) {
    if (WelcomeView == null) WelcomeView = require('./cde-welcome-view')
    return new ActiveEditorInfoView({reporterProxy: this.reporterProxy, ...state})
  }

}
