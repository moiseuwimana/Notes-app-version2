import React from "react"
import Sidebar from "./components/Sidebar"
import Editor from "./components/Editor"
import Split from "react-split"
import { nanoid } from "nanoid"
import { 
    onSnapshot, 
    addDoc, 
    doc, 
    deleteDoc, 
    setDoc   
} from "firebase/firestore"
import { notesCollection, db} from "./firebase"


export default function App() {
    const [notes, setNotes] = React.useState([]);
    const [currentNoteId, setCurrentNoteId] = React.useState("")
    

    const [tempNoteText, setTempNoteText] = React.useState("")


    const currentNote = 
        notes.find(note => note.id === currentNoteId) 
        || notes[0]


    const sortedNotes = notes.sort((a,b) => b.updatedAt - a.updatedAt)

    React.useEffect(()=>{
        if (currentNote){
            setTempNoteText(currentNote.body)
        }
    },[currentNote])


    React.useEffect(() => {
        const unsubscribe = onSnapshot(notesCollection, function(snapshot){
             // Sync up our local notes array with the snapshot data
             const notesArr = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
             })) // fetching data from database and store in "notesArr"
             setNotes(notesArr) // set the notes for the fetched data.
        })
        return unsubscribe
    }, [])
    React.useEffect(()=>{
        if (!currentNoteId){
            setCurrentNoteId(notes[0]?.id)
        }
    },[notes])
    /**
     * Create an effect that runs any time the tempNoteText changes
     * Delay the sending of the request to Firebase
     * uses setTimeout
     * use clearTimeout to cancel the timeout
     */
    React.useEffect(()=>{
        const timeoutId = setTimeout(()=>{
            if (tempNoteText !== currentNote.body){
                updateNote(tempNoteText)
            }    
        },500)
        return () => clearTimeout(timeoutId)
    },[tempNoteText])

    async function createNewNote() {
        const newNote = {
            createdAt: Date.now(),
            updatedAt: Date.now(),
            body: "# Type your markdown note's title here"
        }
        const newNoteRef = await addDoc(notesCollection, newNote) // push data to database
        setCurrentNoteId(newNoteRef.id)
    }

    async function updateNote(text) {
        const docRef = doc(db, "notes", currentNoteId)
        await setDoc(docRef, 
            { 
                body:text, 
                updatedAt: Date.now() 
            }, {merge: true}) // merge helps to not replace other properties if exist.
    } // update note in the firestore

    async function deleteNote(noteId) {
        const docRef = doc(db, "notes", noteId) // get the reference of what is needed to be deleted
        await deleteDoc(docRef) // delete it
    }

    return (
        <main>
            {
                notes.length > 0
                    ?
                    <Split
                        sizes={[30, 70]}
                        direction="horizontal"
                        className="split"
                    >
                        <Sidebar
                            notes={sortedNotes}
                            currentNote={currentNote}
                            setCurrentNoteId={setCurrentNoteId}
                            newNote={createNewNote}
                            deleteNote={deleteNote}
                        />
                        {
                        <Editor
                            tempNoteText={tempNoteText}
                            setTempNoteText={setTempNoteText}
                        />
                        }
                    </Split>
                    :
                    <div className="no-notes">
                        <h1>You have no notes</h1>
                        <button
                            className="first-note"
                            onClick={createNewNote}
                        >
                            Create one now
                </button>
                    </div>

            }
        </main>
    )
}