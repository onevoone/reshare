import firebase from 'firebase/app'
import 'firebase/firestore'


const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
}

firebase.initializeApp(firebaseConfig)
const firestoreDb = firebase.firestore()


/**
 *
 *
 * @param {String} value
 * @param {String} language
 */
export const putGist = (value, language = "") => {
  return firestoreDb.collection('gists').add({ value, language })
}


/**
 *
 *
 * @param {String} gistId
 * @returns {Promise<string>} code value
 */
export const getGist = gistId => {
  const gistRef = firestoreDb.collection('gists').doc(gistId)

  return gistRef.get()
    .then(doc => {
      if (!doc.exists) {
        throw new Error('Gist is missng')
      }
      return doc.data()
    })
    .catch(error => {
      throw error
    })
}
