import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { useEasybase } from 'easybase-react';
import FocusWithin from 'react-focus-within'

function MainMenu() {
  return <div className="MainMenu"></div>;
}

function VocabHeader() {
  return (
    <header id="VocabHeader">
      <div>Chinese (Simplified)</div>
      <div>Chinese (Traditional)</div>
      <div>Pinyin</div>
      <div>English</div>
      <div>Part of Seeech</div>
      <div>Needs Practice</div>
      <div>Notes</div>
    </header>
  );
}

function VocabEntry(props) {

  const doCellChange = (event) => {
    props.handleCellChange(event, props.index);
  }

  return (
    <FocusWithin
      onBlur={() => props.handleVocabUnfocus(props.index)}
    >
      {({ focusProps, isFocused }) => (
        <form className="VocabEntry" spellCheck="false">
          <input {...focusProps} onChange={doCellChange} type="text" className="chinesesimplified" value={props.chinesesimplified} />
          <input {...focusProps} onChange={doCellChange} type="text" className="chinesetraditional" value={props.chinesetraditional} />
          <input {...focusProps} onChange={doCellChange} type="text" className="pinyin" value={props.pinyin} />
          <input {...focusProps} onChange={doCellChange} type="text" className="english" value={props.english} spellCheck="true" />
          <input {...focusProps} onChange={doCellChange} type="text" className="partofspeech" value={props.partofspeech} spellCheck="true" />
          <input {...focusProps} onChange={doCellChange} type="checkbox" className="needspractice" checked={props.needspractice} />
          <input {...focusProps} onChange={doCellChange} type="text" className="notes" value={props.notes ? props.notes : ""} />
        </form>
      )}
    </FocusWithin>
  );
}

function VocabTable(props) {
  const tableBody = props.vocabList.map((vocabEntry, index) => {
    return React.createElement(VocabEntry, {
      ...vocabEntry,
      key: vocabEntry._key,
      handleCellChange: props.handleCellChange,
      handleVocabUnfocus: props.handleVocabUnfocus,
      index: index
    });
  });

  return (
    <section id="VocabTable">
      <VocabHeader />
      {tableBody}
    </section>
  );
}

function AddVocabDialouge(props) {
  const [vocabEntry, setVocabEntry] = useState({ needspractice: false });
  const TABLE = useEasybase().db("VOCAB");

  const handleChange = (event) => {
    const updatedEntry = { ...vocabEntry };
    if (event.target.type === "checkbox") {
      updatedEntry[event.target.className] = event.target.checked;
    } else {
      updatedEntry[event.target.className] = event.target.value;
    }
    setVocabEntry(updatedEntry);
  }

  const submitEntry = async (event) => {
    event.preventDefault();
    if(!window.confirm("Are you sure you want to add?")){
      return;
    }
    const recs = await TABLE.insert(vocabEntry).one();
    props.fetchVocabList();
    console.log(`%c submitted ${recs} vocab entry(ies)`, "color: blue", vocabEntry);
  }

  return (
    <div id="AddVocabDialouge">
      <div>Add Vocab Entry</div>
      <form spellCheck="false">
        Chinese (Simplified)
        <input type="text" onChange={handleChange} defaultValue="" className="chinesesimplified" />
        Chinese (Traditional)
        <input type="text" onChange={handleChange} defaultValue="" className="chinesetraditional" />
        Pinyin
        <input type="text" onChange={handleChange} defaultValue="" className="pinyin" />
        English
        <input type="text" onChange={handleChange} defaultValue="" className="english" spellCheck="true" />
        Part of Speech
        <input type="text" onChange={handleChange} defaultValue="" className="partofspeech" spellCheck="true" />
        Needs Practice?
        <input type="checkbox" onChange={handleChange} className="needspractice" />
        Notes
        <input type="text" onChange={handleChange} defaultValue="" className="notes" />
        <button onClick={submitEntry}>Submit</button>
      </form>
    </div>
  );
}

function App() {
  const [vocabList, setVocabList] = useState([]);
  const [inEditMode, setEditMode] = useState(false);
  const editedEntries = useRef(new Map());
  const pristineVocabList = useRef([]);
  const { db } = useEasybase();
  const TABLE = db("VOCAB");

  const fetchVocabList = async () => {
    const ebData = await TABLE.return().all();
    setVocabList(ebData);
    console.log("%cfetched vocab list", "color: yellow;");
  };

  const pushVocabList = async () => {
    editedEntries.current.forEach((entry, key) => {
      console.log(entry);
      TABLE.where({_key: key}).set(entry).one();
    });
    fetchVocabList();
  }

  const handleVocabUnfocus = (index) => {
    if (!inEditMode) {
      return;
    }
    const vocabEntry = vocabList[index];
    const pristineVocabEntry = pristineVocabList.current[index];

    // check if the vocab entry has been edited since the last push to the db
    if (JSON.stringify(vocabEntry) !== JSON.stringify(pristineVocabEntry)) {
      editedEntries.current.set(vocabEntry._key, vocabEntry);
      console.log("an edit was made");
    } else {
      // if the entry was previously edited but is now pristine, remove it from the edited list
      if (editedEntries.current.has(vocabEntry._key)) {
        editedEntries.current.delete(vocabEntry._key);
      }
      console.log("no edit");
    }
  }

  const handleEditMode = () => {
    if (!inEditMode) {
      // entering edit mode, save a pristine copy of the vocabList
      pristineVocabList.current = vocabList.map((entry) => ({ ...entry }));
    } else {
      // exiting edit mode, update the database
      pushVocabList();
      pristineVocabList.current = [];
      editedEntries.current.clear();
    }

    console.log(`${inEditMode ? "exiting edit mode" : "entering edit mode"}`);
    setEditMode(!inEditMode);
  }

  const handleCancelEdit = () => {
    if(!inEditMode) {
      console.error("wtf should only be accessible in edit mode");
      return;
    }
    
    const newVocabList = pristineVocabList.current.splice(0);
    setVocabList(newVocabList);
    pristineVocabList.current = [];
    editedEntries.current.clear();
    setEditMode(false);
    console.log("edit canceled");
    console.log("exiting edit mode");
  }

  const handleCellEdit = (event, entryIndex) => {
    if (!inEditMode) {
      event.preventDefault();
      return;
    }

    const newVocabList = vocabList.splice(0);
    const targetEntry = newVocabList[entryIndex];

    if (event.target.type === "checkbox") {
      targetEntry[event.target.className] = event.target.checked;
    } else {
      targetEntry[event.target.className] = event.target.value;
    }
    setVocabList(newVocabList);
  }

  useEffect(() => {
    fetchVocabList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div id="App">
      <MainMenu />
      <VocabTable
        vocabList={vocabList}
        handleCellChange={handleCellEdit}
        handleVocabUnfocus={handleVocabUnfocus}
      />
      <button onClick={fetchVocabList}>Fetch Data</button>
      <button onClick={handleEditMode}>{inEditMode ? "Save" : "Edit"}</button>
      {inEditMode && <button onClick={handleCancelEdit}>Cancel</button>}
      <AddVocabDialouge fetchVocabList={fetchVocabList} />
    </div>
  );
}

export default App;