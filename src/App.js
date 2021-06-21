import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import firebase from "firebase/app";
import "firebase/database";
import "firebase/auth";
import pinyin4js from 'pinyin4js';
import '@fortawesome/fontawesome-free/js/all.js';

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

function SignInDialouge({
  signIn,
  handleCloseSignIn
}) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div id="SignInDialouge">
      <label htmlFor="email">Email:</label>
      <input id="email" type='email' value={email} onChange={(e) => setEmail(e.target.value)}></input>
      <label htmlFor="password">Password:</label>
      <input id="password" type='password' value={password} onChange={(e) => setPassword(e.target.value)}></input>
      <button onClick={(e) => signIn(email, password)}>Sign In</button>
      <button onClick={handleCloseSignIn}>Cancel</button>
    </div>
  );
}

function SearchBar({
  handleSearch,
  validFluencies,
  validPOS }) {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("english");
  const [fluency, setFluency] = useState("any");
  const [partOfSpeech, setPOS] = useState("any");

  const POSOptions = validPOS ? Array.from(validPOS)
    .map((pos) => <option value={pos} key={pos}>{camelToTitle(pos)}</option>) : "";

  const fluencyOptions = validFluencies ? Array.from(validFluencies)
    .map(fluency => <option value={fluency} key={fluency}>{camelToTitle(fluency)}</option>) : "";

  return (
    <div id="SearchBar" >
      Search
      <form>
        Search Language:
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          <option value="simplified">中文 (Simplified)</option>
          <option value="traditional">中文 (Traditional)</option>
          <option value="pinyin">拼音</option>
          <option value="english">English</option>
        </select>

        Part of Speech:
        <select value={partOfSpeech} onChange={(e) => setPOS(e.target.value)}>
          <option value="any">Any</option>
          {POSOptions}
        </select>

        Fluency Level:
        <select value={fluency} onChange={(e) => setFluency(e.target.value)}>
          <option value="any">Any</option>
          {fluencyOptions}
        </select>

        <input type="text" value={text} onChange={(e) => setText(e.target.value)} />

        <button onClick={(e) => handleSearch(e, text, language, partOfSpeech, fluency)}>Go!</button>
      </form>
    </div>
  );
}

function VocabHeader() {
  return (
    <header id="VocabHeader">
      <div>Simplified</div>
      <div>Traditional</div>
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
  englishString,
  partsOfSpeech,
  posString,
  fluency,
  notes,
  _key,
  canEdit,
  handleChange,
  handleEntryChineseUnfocus,
  handleNotesInputDone,
  validFluencies,
}) {
  const [notesExpanded, setNotesExpanded] = useState(false);
  const fluencyOptions = Array.from(validFluencies).map(fluency => <option key={fluency} value={fluency}>{camelToTitle(fluency)}</option>);
  const handleNotesDone = (e, newNotes) => {
    handleNotesInputDone(e, _key, newNotes);
    setNotesExpanded(false);
  }

  const textAreaProps = {
    wrap: "soft",
    onChange: handleChange,
    disabled: !canEdit,
    className: "vocabCell"
  }

  return (
    <div className="VocabEntry">

      <TextareaAutosize
        name="simplified"
        value={simplified}
        onBlur={(e) => handleEntryChineseUnfocus(e, _key)}
        {...textAreaProps} />

      <TextareaAutosize
        name="traditional"
        value={traditional}
        onBlur={(e) => handleEntryChineseUnfocus(e, _key)}
        {...textAreaProps} />

      <TextareaAutosize
        name="pinyin"
        value={pinyin}
        {...textAreaProps} />

      <TextareaAutosize name="englishString"
        value={englishString}
        spellCheck="true"
        {...textAreaProps} />

      <TextareaAutosize name="posString"
        value={posString}
        spellCheck="true"
        {...textAreaProps} />

      <select name="fluency"
        onChange={handleChange}
        value={fluency}
        className="vocabCell"
        disabled={!canEdit}>
        {fluencyOptions}
      </select>

      <input name="notes"
        type="text"
        value={notes}
        className="vocabCell"
        onClick={() => setNotesExpanded(true)}
        readOnly
        disabled={!canEdit} />

      {notesExpanded && canEdit && <NotesInput notes={notes} handleNotesInputDone={handleNotesDone} />}
    </div>
  );
}

function VocabEntryWrapper({
  vocabEntry,
  _key,
  canEdit,
  handleCellChange,
  handleEntryChineseUnfocus,
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
        _key={_key}
        canEdit={canEdit}
        handleChange={(e) => handleCellChange(e, _key)}
        handleEntryChineseUnfocus={handleEntryChineseUnfocus}
        handleNotesInputDone={handleNotesInputDone}
        validFluencies={validFluencies}
      />
      <div className="entryBtns">
        <button onClick={(e) => handleEntrySaveChanges(e, _key)} disabled={!canEdit || edited}>
          <i className="fa fa-save"></i>
        </button>
        <button onClick={(e) => handleEntryDiscardChanges(e, _key)} disabled={!canEdit || edited}>
          <i className="fa fa-undo"></i>
        </button>
        <button onClick={(e) => handleEntryDelete(e, _key)} disabled={!canEdit}>
          <i className="fa fa-trash"></i>
        </button>
      </div>
    </form>
  );
}

function VocabTable({
  vocabList,
  editedVocab,
  canEdit,
  handleCellChange,
  handleEntryChineseUnfocus,
  handleEntryDelete,
  handleEntrySaveChanges,
  handleEntryDiscardChanges,
  handleNotesInputDone,
  validFluencies,
}) {
  const tableBody = Array.from(vocabList).map(([key, vocabEntry]) => {
    return (
      <VocabEntryWrapper
        vocabEntry={vocabEntry}
        _key={key}
        canEdit={canEdit}
        handleCellChange={handleCellChange}
        handleEntryChineseUnfocus={handleEntryChineseUnfocus}
        handleEntryDelete={handleEntryDelete}
        handleEntrySaveChanges={handleEntrySaveChanges}
        handleEntryDiscardChanges={handleEntryDiscardChanges}
        handleNotesInputDone={handleNotesInputDone}
        validFluencies={validFluencies}
        edited={!editedVocab.has(key)}
        key={key}
      />
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
  // TODO: memoize fluency options
  // TODO: memoize pos options
  const [renderedVocab, setRenderedVocab] = useState(new Map());  // vocab rendered to screen, modified subset of fullVocabMap
  const fullVocabMap = useRef(new Map());                         // identical to db vocab
  const [editedVocab, setEditedVocab] = useState(new Set());      // subset of rendered vocab that have been edited but not saved
  const isInitialMount = useRef(true);                            // tracks the first db mount
  const validFluencies = useFetchSet("/validFluencies");          // possible fluencies 
  const validPOS = useFetchSet("/validPOS");                      // possible parts of speech 
  const [signedIn, setSignedIn] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

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

        const entry = vocabEntries.get(entrySnapshot.key);
        entry.englishString = entry.english.join(", ");
        entry.posString = entry.partsOfSpeech.join(", ");
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
  // Authentication
  // ----------------------------------------
  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log("signed in");
        setSignedIn(true);
      } else {
        console.log("signed out");
        setSignedIn(false);
      }
    });
  }, []);

  const signIn = (email, password) => {
    firebase.auth().signInWithEmailAndPassword(email, password)
      .catch(err => {
        console.log(err.code);
        console.log(err.message);
      });
    setSignInOpen(false);
  }

  const signOut = () => {
    const confirmation = window.confirm("Unsaved changes will be discarded.");
    if (!confirmation) {
      return;
    }

    editedVocab.forEach(key => {
      renderedVocab.set(key, cloneVocabEntry(fullVocabMap.current.get(key)));
      setRenderedVocab(new Map(renderedVocab));
    });

    firebase.auth().signOut().catch(err => console.log(err))
  };

  // ----------------------------------------
  // Events
  // ----------------------------------------
  const handleCellChange = (e, key) => {
    e.preventDefault();

    const newRenderVocab = new Map(renderedVocab);
    const updatedEntry = newRenderVocab.get(key);
    const property = e.target.name;

    updatedEntry[property] = e.target.value;
    setEditedVocab(new Set(editedVocab).add(key));
    setRenderedVocab(newRenderVocab);
  }

  const handleEntryChineseUnfocus = (e, key) => {
    e.preventDefault();
    const entry = renderedVocab.get(key);
    let needsRerender = false;

    // autofill pinyin if necessary
    if (entry.pinyin === "") {
      entry.pinyin = toPinyin(entry[e.target.name]);
      needsRerender = true;
    }

    if (e.target.name === "simplified" && entry.traditional === "") {
      entry.traditional = pinyin4js.convertToTraditionalChinese(entry.simplified);
      needsRerender = true;
    } else if (e.target.name === "traditional" && entry.simplified === "") {
      entry.simplified = pinyin4js.convertToSimplifiedChinese(entry.traditional);
      needsRerender = true;
    }

    if (needsRerender) {
      setRenderedVocab(new Map(renderedVocab));
    };
  }

  const handleEntrySaveChanges = (e, key) => {
    e.preventDefault();

    // trim array inputs
    const updatedEntry = renderedVocab.get(key);

    updatedEntry.english = updatedEntry.englishString
      .replace(/[\r\n\v]+/g, '')
      .split(",")
      .map(s => s.trim())

    updatedEntry.partsOfSpeech = updatedEntry.posString
      .replace(/[\r\n\v]+/g, '')
      .split(",")
      .map(s => s.trim())

    setRenderedVocab(new Map(renderedVocab));

    // validate parts of speech
    const hasValidPOS = updatedEntry.partsOfSpeech.reduce((validation, pos) => validation && validPOS.has(pos));
    if (!hasValidPOS) {
      console.log("invalid part of speech");
      updatedEntry.partsOfSpeech = [...fullVocabMap.current.get(key).partsOfSpeech];
      setRenderedVocab(new Map(renderedVocab));
      return;
    }
    
    // push change to db
    vocabDatabase.child(key).update(filterObj(updatedEntry,
      (key) => (key !== "englishString" && key !== "posString")
    ), err => {
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
      english: "",
      partsOfSpeech: [""],
      fluency: "fluent",
      notes: "",
    }
    const key = vocabDatabase.push(blankVocab, err => err ? console.error("" + err) : console.log("successful add")).key;

    blankVocab.englishString = "";
    blankVocab.posString = "";

    setRenderedVocab(new Map(renderedVocab).set(key, blankVocab));
  }

  const handleNotesInputDone = (e, key, newNotes) => {
    renderedVocab.get(key).notes = newNotes;
    setEditedVocab(new Set(editedVocab).add(key));
    setRenderedVocab(new Map(renderedVocab));
  };

  const handleSearch = (e, text, language, partOfSpeech, fluency) => {
    e.preventDefault();

    const newRenderVocab = new Map();
    const anyFluency = fluency === "any";
    const anyPOS = partOfSpeech === "any";
    const anyText = text === "";

    const entryHasText = (language !== "english") ?
      (entry) => entry[language].includes(text) :
      (entry) => entry.english.reduce((all, str) => all || str.includes(text), false);

    fullVocabMap.current.forEach((entry, key) => {
      if ((anyFluency || entry.fluency === fluency)
        && (anyPOS || entry.partsOfSpeech.includes(partOfSpeech))
        && (anyText || entryHasText(entry))
      ) {
        newRenderVocab.set(key, cloneVocabEntry(entry));
      }
    });

    setRenderedVocab(newRenderVocab);
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div id="App">
      <SearchBar
        handleSearch={handleSearch}
        validFluencies={validFluencies}
        validPOS={validPOS}
      />

      {(!signedIn && !signInOpen) && <button onClick={() => setSignInOpen(true)}>Sign In</button>}
      {signedIn && <button onClick={() => signOut()}>Sign Out</button>}
      {signInOpen && <SignInDialouge signIn={signIn} handleCloseSignIn={() => setSignInOpen(false)} />}

      <VocabTable
        vocabList={renderedVocab}
        editedVocab={editedVocab}
        canEdit={signedIn}
        handleCellChange={handleCellChange}
        handleEntryChineseUnfocus={handleEntryChineseUnfocus}
        handleEntryDelete={handleEntryDelete}
        handleEntrySaveChanges={handleEntrySaveChanges}
        handleEntryDiscardChanges={handleEntryDiscardChanges}
        handleNotesInputDone={handleNotesInputDone}
        validFluencies={validFluencies}
      />
      {signedIn && <button onClick={handleAddVocab}>Add Vocab</button>}
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

// https://stackoverflow.com/a/37616104/9396808
const filterObj = (obj, predicate) => Object.keys(obj)
  .filter(predicate)
  // eslint-disable-next-line no-sequences
  .reduce((res, key) => (res[key] = obj[key], res), {});

const toPinyin = (chinese) => pinyin4js.convertToPinyinString(chinese, '', pinyin4js.WITH_TONE_MARK);

export default App;