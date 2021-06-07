import './App.css';
import React, { useEffect, useState, Fragment } from 'react';
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
const vocabDatabase = firebase.database().ref("/vocab");

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
      <div>Notes</div>
      <div></div>
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
}) {

  const handleChange = (e) => { handleCellChange(e, _key) };
  return (
    <FocusWithin onBlur={(e) => handleEntryUnfocus(e, _key)}>
      {({ focusProps }) => (
        <form className="VocabEntry" spellCheck="false">
          <input type="text" onChange={handleChange} {...focusProps} name="simplified" value={simplified} />
          <input type="text" onChange={handleChange} {...focusProps} name="traditional" value={traditional} />
          <input type="text" onChange={handleChange} {...focusProps} name="pinyin" value={pinyin} />
          <input type="text" onChange={handleChange} {...focusProps} name="english" value={english} spellCheck="true" />
          <input type="text" onChange={handleChange} {...focusProps} name="partsOfSpeech" value={partsOfSpeech} spellCheck="true" />
          <input type="text" onChange={handleChange} {...focusProps} name="fluency" checked={fluency} />
          <input type="text" onChange={handleChange} {...focusProps} name="notes" value={notes} />
          <button onClick={(e) => handleEntryDelete(e, _key)}>Delete Entry</button>
        </form>
      )}
    </FocusWithin>
  );
}

function VocabTable({ vocabList, handleCellChange, handleEntryUnfocus, handleEntryDelete }) {
  const tableBody = Array.from(vocabList).map(([key, vocabEntry]) => {
    return (
      <Fragment key={key}>
        <VocabEntry
          {...vocabEntry}
          _key={key}
          handleCellChange={handleCellChange}
          handleEntryUnfocus={handleEntryUnfocus}
          handleEntryDelete={handleEntryDelete}
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
  // The vocab list that gets rendered to the screen and the user interacts with
  const [vocabList, setVocabList] = useState(new Map());

  // ----------------------------------------
  // Database 
  // ----------------------------------------
  useEffect(() => {
    const listener = vocabDatabase.on('value', snapshot => {
      const vocabEntries = new Map();
      snapshot.forEach(entrySnapshot => {
        vocabEntries.set(entrySnapshot.key, entrySnapshot.val());
      });
      setVocabList(vocabEntries);
    });
    return () => vocabDatabase.off('value', listener);
  }, []);

  // ----------------------------------------
  // Events
  // ----------------------------------------
  const handleCellChange = (e, key) => {
    e.preventDefault();
    console.log("implement change", key, e.target.name);
  }

  const handleEntryUnfocus = (e, key) => {
    console.log("implement unfocus", key, e.target.name);
  }

  const handleEntryDelete = (e, key) => {
    e.preventDefault();
    console.log("implement delete", key, e.target.name)
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div id="App">
      <SearchBar />
      <VocabTable
        vocabList={vocabList}
        handleCellChange={handleCellChange}
        handleEntryUnfocus={handleEntryUnfocus}
        handleEntryDelete={handleEntryDelete}
      />
      <AddVocabDialouge />
    </div>
  );
}

// const cloneMap = (map) => {
//   const clone = new Map();
//   map.forEach((entry, key) => clone.set(key, { ...entry }));
//   return clone;
// }

// const toTileCase = (str) => str.toLowerCase()
//   .split(' ')
//   .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
//   .join(' ');

export default App;