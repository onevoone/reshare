import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import { putGist, getGist } from './firebase.js'


self.MonacoEnvironment = {
  getWorker: () => (
    new Worker('../node_modules/monaco-editor/esm/vs/editor/editor.worker.js')
  )
}


const appendNotification = message => {
  const body = document.getElementsByTagName('body')[0]

  body.insertAdjacentHTML(
    'afterbegin',
    `<div class="notification" id="notification">${message}</div>`
  )

  const notification = document.getElementById('notification')

  setTimeout(() => {
    notification.setAttribute('style', 'top: 32px;')
    setTimeout(() => {
      notification.setAttribute('style', 'top: 0;')
      setTimeout(() => {
        notification.remove()
      }, 100)
    }, 1200)
  }, 100)
}


import('./monaco-features.js').then(() => {
  const container = document.getElementById('container')
  const createNewButton = document.getElementById('create-new-btn')
  const saveCodeButton = document.getElementById('save-code-btn')
  const shareCodeButton = document.getElementById('share-code-btn')
  const languageList = document.getElementById('language-list')
  const selectedLanguage = document.getElementById('selected-language')
  const colorSchemeToggle = document.getElementById('color-scheme-toggle')

  const initialLanguage = 'javascript'
  const initialText = 'const write = "here.."'

  const editor = monaco.editor.create(container, {
    value: initialText,
    language: initialLanguage,
    tabSize: 2,
    scrollBeyondLastLine: false,
    theme: self.colorScheme.getEditorTheme(),
    hideCursorInOverviewRuler: true,
    matchBrackets: true,
    overviewRulerBorder: false,
    renderLineHighlight: 'none',
    minimap: { enabled: false },
    smoothScrolling: true,
  })

  editor.setPosition({ column: initialText.length + 1, lineNumber: 1 })
  editor.focus()


  window.addEventListener('resize', () => {
    editor.layout()
  })
  
  document.addEventListener(
    'keydown',
    e => {
      if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) {
        e.preventDefault()
        // do nothing
      }
    },
    false
  )


  const updateLanguage = lang => {    
    selectedLanguage.innerText = lang
    monaco.editor.setModelLanguage(editor.getModel(), lang)
  }

  updateLanguage(initialLanguage)


  /**
   *
   * set up language list
   * 
   */
  monaco.languages.getLanguages().forEach(lang => {
    const option = document.createElement('li')
    const button = document.createElement('button')

    button.type = 'button'
    button.className = 'menu-button'
    button.id = lang.id
    button.innerText = lang.id

    option.appendChild(button)
    languageList.appendChild(option)
  })


  /**
   *
   * select language handler
   * 
   */
  languageList.onclick = e => {
    e.preventDefault()

    const language = e.target.id
    updateLanguage(language)
  }


  /**
   *
   * create new empty gist handler
   * 
   */
  createNewButton.onclick = e => {
    e.preventDefault()

    location.replace('/')
  }


  /**
   *
   * save gist handlers
   * 
   */
  const handlePutGist = () => {
    const value = editor.getValue()
    const language = editor.getModel()._languageIdentifier.language

    putGist(value, language)
      .then(res => {
        location.href = `${location.origin}/#${res.id}`
        appendNotification('Saved.')
      })
      .catch(error => {
        console.log('error: ', error);
      })
  }

  saveCodeButton.onclick = e => {
    e.preventDefault()

    handlePutGist()
  }

  editor.addCommand(
    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S,
    () => handlePutGist()
  )


  /**
   *
   * copy url link of gist
   * 
   */
  shareCodeButton.onclick = e => {
    e.preventDefault()
    navigator.clipboard.writeText(location.href)
    appendNotification('Page URL copied to clipboard.')
  }


  /**
   *
   * change user color scheme handler
   * 
   */
  colorSchemeToggle.onclick = e => {
    e.preventDefault()

    self.colorScheme.toggle()
    monaco.editor.setTheme(colorScheme.getEditorTheme())
  }



  window.onload = () => {
    const gistId = location.hash.substring(1)

    if (!gistId) {
      return
    }

    getGist(gistId)
      .then(({ value, language }) => {
        updateLanguage(language)
        editor.setValue(value)
      })
      .catch(error => {
        console.error('Error getting document: ', error)
      })
  }

})
