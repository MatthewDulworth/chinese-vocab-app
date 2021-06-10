import './App.css';
import React, { useEffect, useRef, useState, Fragment } from 'react';
import firebase from "firebase/app";
import "firebase/database";

var firebaseConfig = {
  apiKey: "AIzaSyDIefnuJTzI4sUlFuNoRepOM6GDMsPdHTU",
  authDomain: "vocabapp-3741c.firebaseapp.com",
  databaseURL: "https://vocabapp-3741c-default-rtdb.firebaseio.com",
  projectId: "vocabapp-3741c",
  storageBucket: "vocabapp-3741c.appspot.com",
  messagingSenderId: "194089023131",
  appId: "1:194089023131:web:5d5f74308d24971c9bf83e"
};
!firebase.apps.length ? firebase.initializeApp(firebaseConfig) : firebase.app()
const DATABASE = firebase.database();
const vocabDatabase = DATABASE.ref("/vocab");

function SearchBar() {
  const [searchText, setSearchText] = useState("");
  const [searchLang, setSearchLang] = useState("english");
  const [searchPOS, setSearchPos] = useState("any");
  const [fluencyLevel, setFluencyLevel] = useState("any");

  return (
    <div id="SearchBar" >
      Search
      <form>

        Search Language:
        <select value={searchLang} onChange={(e) => setSearchLang(e.target.value)}>
          <option value="chinesesimplified">中文 (Simplified)</option>
          <option value="chinesetraditional">中文 (Traditional)</option>
          <option value="pinyin">拼音</option>
          <option value="english">English</option>
        </select>

        Part of Speech:
        <select value={searchPOS} onChange={(e) => setSearchPos(e.target.value)}>
          <option value="any">Any</option>
          {/* {partsOfSpeech.map((pos, i) => <option value={pos} key={i}>{toTileCase(pos)}</option>)} */}
        </select>

        Fluency Level:
        <select value={fluencyLevel} onChange={(e) => setFluencyLevel(e.target.value)}>
          <option value="any">Any</option>
          <option value="needs practice">Needs Practice</option>
          <option value="fluent">Fluent</option>
        </select>

        <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} />

        <button>Go!</button>
      </form>
    </div>
  );
}

function VocabHeader() {
  return (
    <header id="VocabHeader">
      <div>Chinese (Simplified)</div>
      <div>Chinese (Traditional)</div>
      <div>Pinyin</div>
      <div>English</div>
      <div>Parts of Speech</div>
      <div>Fluency</div>
      <div className="last">Notes</div>
    </header>
  );
}

function NotesInput({
  notes,
  handleNotesInputDone
}) {
  const [newNotes, setNewNotes] = useState(notes);
  const textArea = useRef(null);

  useEffect(() => {
    textArea.current.focus();
    textArea.current.setSelectionRange(textArea.current.value.length, textArea.current.value.length);
  }, []);

  return (
    <div className="NotesInput">
      <div>
        <textarea rows="10" cols="50" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} ref={textArea}></textarea>
        <button onClick={(e) => handleNotesInputDone(e, newNotes)}>Done</button>
      </div>
    </div>
  );
}

function VocabEntry({
  simplified,
  traditional,
  pinyin,
  english,
  partsOfSpeech,
  fluency,
  notes,
  handleChange,
  handleNotesInputDone,
  validFluencies,
}) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const fluencyOptions = Array.from(validFluencies).map(fluency => <option key={fluency} value={fluency}>{camelToTitle(fluency)}</option>);
  const handleNotesDone = (e, newNotes) => {
    handleNotesInputDone(e, newNotes);
    setNotesExpanded(false);
  }

  return (
    <div className="VocabEntry">
      <input type="text" onChange={handleChange} name="simplified" value={simplified} />
      <input type="text" onChange={handleChange} name="traditional" value={traditional} />
      <input type="text" onChange={handleChange} name="pinyin" value={pinyin} />
      <input type="text" onChange={handleChange} name="english" value={english} spellCheck="true" />
      <input type="text" onChange={handleChange} name="partsOfSpeech" value={partsOfSpeech} spellCheck="true" />
      <select onChange={handleChange} name="fluency" value={fluency}>{fluencyOptions}</select>
      <input type="text" onClick={() => setNotesExpanded(true)} readOnly name="notes" value={notes} />
      { notesExpanded && <NotesInput notes={notes} handleNotesInputDone={handleNotesDone} />}
    </div>
  );
}

function VocabEntryWrapper({
  vocabEntry,
  _key,
  handleCellChange,
  handleEntryDelete,
  handleEntrySaveChanges,
  handleEntryDiscardChanges,
  handleNotesInputDone,
  validFluencies,
  edited,
}) {
  return (
    <form className="VocabEntryWrapper" spellCheck="false">
      <VocabEntry
        {...vocabEntry}
        handleChange={(e) => handleCellChange(e, _key)}
        handleNotesInputDone={(e, newNotes) => handleNotesInputDone(e, _key, newNotes)}
        validFluencies={validFluencies}
      />
      <button onClick={(e) => handleEntryDelete(e, _key)}>Delete Entry</button>
      <button onClick={(e) => handleEntrySaveChanges(e, _key)} disabled={edited}>Save Changes</button>
      <button onClick={(e) => handleEntryDiscardChanges(e, _key)} disabled={edited}>Discard Changes</button>
    </form>
  );
}

function VocabTable({
  vocabList,
  editedVocab,
  handleCellChange,
  handleEntryDelete,
  handleEntrySaveChanges,
  handleEntryDiscardChanges,
  handleNotesInputDone,
  validFluencies,
}) {
  const tableBody = Array.from(vocabList).map(([key, vocabEntry]) => {
    return (
      <Fragment key={key}>
        <VocabEntryWrapper
          vocabEntry={vocabEntry}
          _key={key}
          handleCellChange={handleCellChange}
          handleEntryDelete={handleEntryDelete}
          handleEntrySaveChanges={handleEntrySaveChanges}
          handleEntryDiscardChanges={handleEntryDiscardChanges}
          handleNotesInputDone={handleNotesInputDone}
          validFluencies={validFluencies}
          edited={!editedVocab.has(key)}
        />
      </Fragment>
    );
  });

  return (
    <section id="VocabTable">
      <VocabHeader />
      {tableBody}
    </section>
  );
}

// ----------------------------------------------------------------------
// App
// ----------------------------------------------------------------------
function App() {
  const [renderedVocab, setRenderedVocab] = useState(new Map());  // vocab rendered to screen, modified subset of fullVocabMap
  const fullVocabMap = useRef(new Map());                         // identical to db vocab
  const [editedVocab, setEditedVocab] = useState(new Set());      // subset of rendered vocab that have been edited but not saved
  const isInitialMount = useRef(true);                            // tracks the first db mount
  const validFluencies = useFetchSet("/validFluencies");          // possible fluencies
  const validPOS = useFetchSet("/validPOS");                      // possible parts of speech

  // ----------------------------------------
  // Database 
  // ----------------------------------------
  useEffect(() => {
    // fetches vocab from the database everytime the database updates
    const listener = vocabDatabase.on('value', snapshot => {

      // fetch vocab entries from db
      const vocabEntries = new Map();
      snapshot.forEach(entrySnapshot => {
        vocabEntries.set(entrySnapshot.key, entrySnapshot.val());
      });
      fullVocabMap.current = vocabEntries;

      if (isInitialMount.current) {
        setRenderedVocab(cloneVocabMap(vocabEntries));
        isInitialMount.current = false;
      }
      console.log("%cfetching db", "color: yellow;");
    }, err => {
      console.error("failed fetch: " + err);
    });
    return () => vocabDatabase.off('value', listener);
  }, []);

  // ----------------------------------------
  // Events
  // ----------------------------------------
  const handleCellChange = (e, key) => {
    e.preventDefault();

    const newRenderVocab = new Map(renderedVocab);
    const updatedEntry = newRenderVocab.get(key);
    const property = e.target.name;

    if (Array.isArray(updatedEntry[property])) {
      const newArray = e.target.value.replace(/\s+/g, '').split(",");
      updatedEntry[property] = newArray;
    } else {
      updatedEntry[property] = e.target.value;
    }
    setEditedVocab(new Set(editedVocab).add(key));
    setRenderedVocab(newRenderVocab);
  }

  const handleEntrySaveChanges = (e, key) => {
    e.preventDefault();
    // validate parts of speech
    const updatedEntry = renderedVocab.get(key);
    const hasValidPOS = updatedEntry.partsOfSpeech.reduce((validation, pos) => validation && validPOS.has(pos));

    if (!hasValidPOS) {
      console.log("invalid part of speech");
      updatedEntry.partsOfSpeech = [...fullVocabMap.current.get(key).partsOfSpeech];
      setRenderedVocab(new Map(renderedVocab));
      return;
    }
    // push change to db
    vocabDatabase.child(key).update(updatedEntry, err => {
      err ? console.error("failed update: " + err) : console.log("successful update");
    });
    // remove from unsaved list 
    const unsaved = new Set(editedVocab);
    unsaved.delete(key);
    setEditedVocab(unsaved);
  }

  const handleEntryDiscardChanges = (e, key) => {
    e.preventDefault();
    // reset entry from fullVocabMap
    setRenderedVocab(new Map(renderedVocab.set(key, cloneVocabEntry(fullVocabMap.current.get(key)))));
    // remove entry from unsaved list
    const unsaved = new Set(editedVocab);
    unsaved.delete(key);
    setEditedVocab(unsaved);
  }

  const handleEntryDelete = (e, key) => {
    e.preventDefault();

    const confirmation = window.confirm("Delete Entry?");

    if (confirmation) {
      console.log("confirmed");
      vocabDatabase.child(key).remove(err => err ? console.error("" + err) : console.log("deleted entry"));
      renderedVocab.delete(key);
      setRenderedVocab(new Map(renderedVocab));
    }
  }

  const handleAddVocab = (e) => {
    e.preventDefault();

    const blankVocab = {
      simplified: "",
      traditional: "",
      pinyin: "",
      english: [""],
      partsOfSpeech: [""],
      fluency: "fluent",
      notes: "",
    }
    const key = vocabDatabase.push(blankVocab, err => err ? console.error("" + err) : console.log("successful add")).key;
    setRenderedVocab(new Map(renderedVocab).set(key, blankVocab));
  }

  const handleNotesInputDone = (e, key, newNotes) => {
    renderedVocab.get(key).notes = newNotes;
    setEditedVocab(new Set(editedVocab).add(key));
    setRenderedVocab(new Map(renderedVocab));
  };

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div id="App">
      <SearchBar />
      <VocabTable
        vocabList={renderedVocab}
        editedVocab={editedVocab}
        handleCellChange={handleCellChange}
        handleEntryDelete={handleEntryDelete}
        handleEntrySaveChanges={handleEntrySaveChanges}
        handleEntryDiscardChanges={handleEntryDiscardChanges}
        handleNotesInputDone={handleNotesInputDone}
        validFluencies={validFluencies}
      />
      <button onClick={handleAddVocab}>Add Vocab</button>
    </div>
  );
}

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------

// https://stackoverflow.com/a/39718708/9396808
const camelToTitle = (camelCase) => camelCase
  .replace(/([A-Z])/g, (match) => ` ${match}`)
  .replace(/^./, (match) => match.toUpperCase())
  .trim();

const useFetchSet = (refStr) => {
  const [state, setState] = useState(null);
  const ref = DATABASE.ref(refStr);

  useEffect(() => {
    const listener = ref.on('value', snapshot => {
      const newState = new Set();
      snapshot.forEach(value => { newState.add(value.key) }
      );
      setState(newState);
    }, (err) => {
      console.log('%cThe read failed: ' + err, "color: red;");
    });
    return () => vocabDatabase.off('value', listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}

const cloneVocabMap = (map) => {
  const clone = new Map();
  map.forEach((entry, key) => clone.set(key, cloneVocabEntry(entry)));
  return clone;
}

const cloneVocabEntry = (vocabEntry) => {
  const entryClone = {};
  for (const propertyKey in vocabEntry) {
    const propertyValue = vocabEntry[propertyKey];

    if (Array.isArray(propertyValue)) {
      entryClone[propertyKey] = [...propertyValue];
    } else {
      entryClone[propertyKey] = propertyValue;
    }
  }
  return entryClone;
}

export default App;