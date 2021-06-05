import './App.css';
import React, { useEffect, useRef, useState, Fragment } from 'react';
import { useEasybase } from 'easybase-react';
import FocusWithin from 'react-focus-within';

function MainMenu() {
  return <div className="MainMenu"></div>;
}

function SearchBar(props) {
  const [searchText, setSearchText] = useState("");

  const handleSearchTextChange = (event) => {
    if(props.inEditMode) {
      event.preventDefault();
      return;
    }

    setSearchText(event.target.value);
  }

  return (
    <div id="SearchBar" >
      Search
      <form>
        <input type="text" value={searchText} onChange={handleSearchTextChange} disabled={props.inEditMode}/>
        <button disabled={props.inEditMode}>go!</button>
      </form>
    </div>
  );
}

function VocabHeader(props) {
  return (
    <header id="VocabHeader">
      <div>Chinese (Simplified)</div>
      <div>Chinese (Traditional)</div>
      <div>Pinyin</div>
      <div>English</div>
      <div>Part of Seeech</div>
      <div>Needs Practice</div>
      <div>Notes</div>
      {props.inEditMode && <div></div>}
    </header>
  );
}

function VocabEntry(props) {

  const doCellChange = (event) => {
    props.handleCellChange(event, props._key);
  }

  return (
    <FocusWithin
      onBlur={() => props.handleVocabUnfocus(props._key)}
    >
      {({ focusProps, isFocused }) => (
        <form className="VocabEntry" spellCheck="false">
          <input className="chinesesimplified" value={props.chinesesimplified}
            {...focusProps} onChange={doCellChange} disabled={props.disabled} type="text" />

          <input className="chinesetraditional" value={props.chinesetraditional}
            {...focusProps} onChange={doCellChange} disabled={props.disabled} type="text" />

          <input className="pinyin" value={props.pinyin}
            {...focusProps} onChange={doCellChange} disabled={props.disabled} type="text" />

          <input className="english" value={props.english}
            {...focusProps} onChange={doCellChange} disabled={props.disabled} type="text" spellCheck="true" />

          <input className="partofspeech" value={props.partofspeech}
            {...focusProps} onChange={doCellChange} disabled={props.disabled} type="text" spellCheck="true" />

          <input className="needspractice" checked={props.needspractice}
            {...focusProps} onChange={doCellChange} disabled={props.disabled} type="checkbox" />

          <input className="notes" value={props.notes ? props.notes : ""}
            {...focusProps} onChange={doCellChange} disabled={props.disabled} type="text" />
        </form>
      )}
    </FocusWithin>
  );
}

function VocabTable(props) {
  const tableBody = Array.from(props.vocabList).map(([key, vocabEntry]) => {
    const disabled = props.disabledEntries.has(key);
    return (
      <Fragment key={key}>
        {React.createElement(VocabEntry, {
          ...vocabEntry,
          handleCellChange: props.handleCellChange,
          handleVocabUnfocus: props.handleVocabUnfocus,
          disabled: disabled,
          _key: key
        })}
        {props.inEditMode && <button onClick={props.handleDeleteEntryClick} _key={key} disabled={disabled}> Delete </button>}
      </Fragment>
    );
  });

  return (
    <section id="VocabTable" className={props.inEditMode ? "tableEditMode" : "tableNormalMode"}>
      <VocabHeader inEditMode={props.inEditMode} />
      {tableBody}
    </section>
  );
}

function AddVocabDialouge(props) {
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
  const TABLE = useEasybase().db("VOCAB");

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
    const recs = await TABLE.insert(vocabEntry).one();
    props.fetchVocabList();
    console.log(`submitted ${recs} vocab entries`);
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
  const [vocabList, setVocabList] = useState(new Map());
  const [inEditMode, setEditMode] = useState(false);
  const [deletedEntries, setDeletedEntries] = useState(new Set());
  const editedEntries = useRef(new Set());
  const pristineVocabList = useRef(new Map());
  const { db } = useEasybase();
  const TABLE = db("VOCAB");

  // ----------------------------------------
  // Database 
  // ----------------------------------------
  const fetchVocabList = async () => {
    const ebData = await TABLE.return().all();

    const vocab = new Map();
    ebData.forEach((row) => {
      vocab.set(row._key, row);
    });

    setVocabList(vocab);
    console.log("%cfetched vocab list", "color: yellow;");
  };

  const pushVocabList = async () => {

    let updated = 0;
    editedEntries.current.forEach(async (key) => {
      const entry = vocabList.get(key);
      updated += await TABLE.where({ _key: key }).set(entry).one();
    });

    let deleted = 0;
    deletedEntries.forEach(async (key) => {
      deleted += await TABLE.delete().where({ _key: key }).one();
    });

    console.log(`updated ${updated} vocab entries, deleted ${deleted} vocab entries`)

    if (editedEntries.current.size !== 0 || deletedEntries.size !== 0) {
      fetchVocabList();
    }
  }

  useEffect(() => {
    // initial db fetch
    fetchVocabList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------
  // Event Handlers
  // ----------------------------------------
  const handleDeleteEntryClick = (event) => {
    if (!inEditMode) {
      event.preventDefault();
      return;
    }

    const key = event.target.getAttribute("_key");
    editedEntries.current.delete(key);
    setDeletedEntries(new Set(deletedEntries).add(key));
  }

  const handleVocabUnfocus = (key) => {
    if (!inEditMode) {
      return;
    }
    const vocabEntry = vocabList.get(key);
    const pristineVocabEntry = pristineVocabList.current.get(key);

    // check if the vocab entry has been edited since the last push to the db
    if (JSON.stringify(vocabEntry) !== JSON.stringify(pristineVocabEntry)) {
      editedEntries.current.add(key);
    } else {
      // if the entry was previously edited but is now pristine, remove it from the edited list
      editedEntries.current.delete(key);
    }
  }

  const handleEditMode = () => {
    if (!inEditMode) {
      // entering edit mode, save a pristine copy of the vocabList
      pristineVocabList.current = cloneMap(vocabList);
    } else {
      // exiting edit mode, update the database
      pushVocabList();
      pristineVocabList.current.clear();
      editedEntries.current.clear();
      setDeletedEntries(new Set());
    }

    console.log(`${inEditMode ? "exiting edit mode" : "entering edit mode"}`);
    setEditMode(!inEditMode);
  }

  const handleCancelEdit = () => {
    if (!inEditMode) {
      console.error("wtf should only be accessible in edit mode");
      return;
    }

    console.log(`exiting edit mode`);
    console.log(`\trestored ${deletedEntries.size} deleted entries`);
    console.log(`\trestored ${editedEntries.current.size} edited entries`);

    // restore the vocab list 
    const newVocabList = cloneMap(pristineVocabList.current);
    setVocabList(newVocabList);
    pristineVocabList.current.clear();

    // clear deleted and edited entries 
    editedEntries.current.clear();
    deletedEntries.clear();
    setEditMode(false);
  }

  const handleCellEdit = (event, key) => {
    if (!inEditMode) {
      event.preventDefault();
      return;
    }

    const newVocabList = cloneMap(vocabList);
    const targetEntry = newVocabList.get(key);

    if (event.target.type === "checkbox") {
      targetEntry[event.target.className] = event.target.checked;
    } else {
      targetEntry[event.target.className] = event.target.value;
    }
    setVocabList(newVocabList);
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div id="App">
      <SearchBar inEditMode={inEditMode} />
      <MainMenu />
      <VocabTable
        vocabList={vocabList}
        disabledEntries={deletedEntries}
        handleCellChange={handleCellEdit}
        handleVocabUnfocus={handleVocabUnfocus}
        handleDeleteEntryClick={handleDeleteEntryClick}
        inEditMode={inEditMode}
      />
      <button onClick={fetchVocabList}>Fetch Data</button>
      <button onClick={handleEditMode}>{inEditMode ? "Save" : "Edit"}</button>
      {inEditMode && <button onClick={handleCancelEdit}>Cancel</button>}
      <AddVocabDialouge fetchVocabList={fetchVocabList} />
    </div>
  );
}

const cloneMap = (map) => {
  const clone = new Map();
  map.forEach((entry, key) => clone.set(key, { ...entry }));
  return clone;
}

export default App;