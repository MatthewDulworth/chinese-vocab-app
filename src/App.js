import './App.css';
import React, { useEffect, useRef, useState, Fragment } from 'react';
import FocusWithin from 'react-focus-within';
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

function VocabEntry({
  simplified,
  traditional,
  pinyin,
  english,
  partsOfSpeech,
  fluency,
  notes,
  _key,
  handleCellChange,
  handleEntryUnfocus,
  handleEntryDelete,
  handleEntrySaveChanges,
  validFluencies,
  saveDisabled,
}) {

  const handleChange = (e) => { handleCellChange(e, _key) };
  const fluencyOptions = Array.from(validFluencies).map(val => <option key={val} value={val}>{camelToTitle(val)}</option>);

  console.log(_key, saveDisabled);
  return (
    <FocusWithin onBlur={(e) => handleEntryUnfocus(e, _key)}>
      {({ focusProps }) => (
        <form className="VocabEntry" spellCheck="false">
          <input type="text" onChange={handleChange} {...focusProps} name="simplified" value={simplified} />
          <input type="text" onChange={handleChange} {...focusProps} name="traditional" value={traditional} />
          <input type="text" onChange={handleChange} {...focusProps} name="pinyin" value={pinyin} />
          <input type="text" onChange={handleChange} {...focusProps} name="english" value={english} spellCheck="true" />
          <input type="text" onChange={handleChange} {...focusProps} name="partsOfSpeech" value={partsOfSpeech} spellCheck="true" />
          <select onChange={handleChange} {...focusProps} name="fluency" value={fluency}>{fluencyOptions}</select>
          <input type="text" onChange={handleChange} {...focusProps} name="notes" value={notes} />
          <button onClick={(e) => handleEntryDelete(e, _key)}>Delete Entry</button>
          <button onClick={(e) => handleEntrySaveChanges(e, _key)} disabled={saveDisabled}>Save Changes</button>
        </form>
      )}
    </FocusWithin>
  );
}

function VocabTable({
  vocabList,
  unsavedVocab,
  handleCellChange,
  handleEntryUnfocus,
  handleEntryDelete,
  handleEntrySaveChanges,
  validFluencies,
}) {
  const tableBody = Array.from(vocabList).map(([key, vocabEntry]) => {
    return (
      <Fragment key={key}>
        <VocabEntry
          {...vocabEntry}
          _key={key}
          handleCellChange={handleCellChange}
          handleEntryUnfocus={handleEntryUnfocus}
          handleEntryDelete={handleEntryDelete}
          handleEntrySaveChanges={handleEntrySaveChanges}
          validFluencies={validFluencies}
          saveDisabled={!unsavedVocab.has(key)}
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

function AddVocabDialouge() {
  const blankEntry = {
    chinesesimplified: "",
    chinesetraditional: "",
    pinyin: "",
    english: "",
    partofspeech: "",
    needspractice: false,
    notes: "",
  };

  const [vocabEntry, setVocabEntry] = useState(blankEntry);
  // const TABLE = useEasybase().db("VOCAB");

  const handleChange = (event) => {
    const updatedEntry = { ...vocabEntry };
    if (event.target.type === "checkbox") {
      updatedEntry[event.target.name] = event.target.checked;
    } else {
      updatedEntry[event.target.name] = event.target.value;
    }
    setVocabEntry(updatedEntry);
  }

  const submitEntry = async (event) => {
    event.preventDefault();
    // const recs = await TABLE.insert(vocabEntry).one();
    console.log(`submitted ${0} vocab entries: NOT IMPLEMENTED`);
    setVocabEntry(blankEntry);
  }

  return (
    <div id="AddVocabDialouge">
      <div>Add Vocab Entry</div>
      <form spellCheck="false">
        Chinese (Simplified)
        <input type="text" onChange={handleChange} value={vocabEntry.chinesesimplified} name="chinesesimplified" />
        Chinese (Traditional)
        <input type="text" onChange={handleChange} value={vocabEntry.chinesetraditional} name="chinesetraditional" />
        Pinyin
        <input type="text" onChange={handleChange} value={vocabEntry.pinyin} name="pinyin" />
        English
        <input type="text" onChange={handleChange} value={vocabEntry.english} name="english" spellCheck="true" />
        Part of Speech
        <input type="text" onChange={handleChange} value={vocabEntry.partofspeech} name="partofspeech" spellCheck="true" />
        Needs Practice?
        <input type="checkbox" onChange={handleChange} checked={vocabEntry.needspractice} name="needspractice" />
        Notes
        <input type="text" onChange={handleChange} value={vocabEntry.notes} name="notes" />
        <button onClick={submitEntry}>Submit</button>
      </form>
    </div>
  );
}

// ----------------------------------------------------------------------
// App
// ----------------------------------------------------------------------
function App() {
  const [renderedVocab, setRenderedVocab] = useState(new Map());  // vocab rendered to screen, modified subset of fullVocabMap
  const fullVocabMap = useRef(new Map());                         // identical to db vocab
  const [unsavedVocab, setUnsavedVocab] = useState(new Set());    // subset of rendered vocab that have been edited but not saved
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
    setUnsavedVocab(new Set(unsavedVocab).add(key));
    setRenderedVocab(newRenderVocab);
  }

  const handleEntryUnfocus = (e, key) => {
    console.log("implement handle unfocus", key)
  };

  const handleEntrySaveChanges = (e, key) => {
    vocabDatabase.child(key).update(renderedVocab.get(key), err => {
      err ? console.error("failed update: " + err) : console.log("successful update");
    });
    const unsaved = new Set(unsavedVocab).delete(key);
    setUnsavedVocab(unsaved);
  }

  const handleEntryDelete = (e, key) => {
    e.preventDefault();
    console.log("implement handle delete", key);
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div id="App">
      <SearchBar />
      <VocabTable
        vocabList={renderedVocab}
        unsavedVocab={unsavedVocab}
        handleCellChange={handleCellChange}
        handleEntryUnfocus={handleEntryUnfocus}
        handleEntryDelete={handleEntryDelete}
        handleEntrySaveChanges={handleEntrySaveChanges}
        validFluencies={validFluencies}
        validPOS={validPOS}
      />
      <AddVocabDialouge />
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

  map.forEach((entry, key) => {
    const entryClone = {};
    for (const propertyKey in entry) {
      const propertyValue = entry[propertyKey];

      if (Array.isArray(propertyValue)) {
        entryClone[propertyKey] = [...propertyValue];
      } else {
        entryClone[propertyKey] = propertyValue;
      }
    }
    clone.set(key, entryClone);
  });
  return clone;
}

export default App;