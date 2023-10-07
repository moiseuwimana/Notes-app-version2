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
    
    /**
     * Challenge:
     * 1. Set up a new state variable called 'tempNoteText'. Initialize it as an empty string
     * 2. Change the Editor so that it uses 'tempNoteText' and 'setTempNoteText' for displaying and changing the text instead of dealing directly with the 'currentNote' data.
     * 3. Create a useEffect that, if there's a 'currentNote', sets the 'tempNoteText' to 'currentNote.body'. (This copies the current note's text into the 'tempNoteText' field so whenever the user changes the currentNote, the editor can display the correct text.)
     */

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