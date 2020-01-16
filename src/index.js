import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js'
import { putGist, getGist } from './firebase.js'


self.MonacoEnvironment = {
  getWorker: () => (
    new Worker('../node_modules/monaco-editor/esm/vs/editor/editor.worker.js')
  )
}


const appendNotification = () => {
  const body = document.getElementsByTagName('body')[0]

  body.insertAdjacentHTML(
    'afterbegin',
    '<div class="notification" id="notification">Copied to clipboard.</div>'
  )

  const notification = document.getElementById('notification')

  setTimeout(() => {
    notification.setAttribute('style', 'top: 32px;')
    setTimeout(() => {
      notification.setAttribute('style', 'top: 0;')
      setTimeout(() => {
        notification.remove()
      }, 100)
    }, 700)
  }, 100)
}


import('./monaco-features.js').then(() => {
  const createNewButton = document.getElementById('create-new-btn')
  const saveCodeButton = document.getElementById('save-code-btn')
  const shareCodeButton = document.getElementById('share-code-btn')
  const languageList = document.getElementById('language-list')
  const selectedLanguage = document.getElementById('selected-language')

  const initialLanguage = 'javascript'
  const initialText = 'const write = "here.."'


  const editor = monaco.editor.create(document.getElementById('container'), {
    value: initialText,
    language: initialLanguage,
    tabSize: 2,
    scrollBeyondLastLine: false,
    theme: 'vs-dark',
    hideCursorInOverviewRuler: true,
    matchBrackets: true,
    overviewRulerBorder: false,
    renderLineHighlight: 'none',
    minimap: { enabled: false },
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
   * save gist handler
   * 
   */
  saveCodeButton.onclick = e => {
    e.preventDefault()

    const value = editor.getValue()
    const language = editor.getModel()._languageIdentifier.language

    putGist(value, language)
      .then(res => {
        location.pathname = `/${res.id}`
      })
      .catch(error => {
        console.log('error: ', error);
      })
  }


  /**
   *
   * copy url link of gist
   * 
   */
  shareCodeButton.onclick = e => {
    e.preventDefault()
    navigator.clipboard.writeText(location.href)
    appendNotification()
  }


  window.onload = () => {
    const gistId = location.pathname.substring(1)

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
