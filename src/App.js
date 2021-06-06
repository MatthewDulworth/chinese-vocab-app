import './App.css';
import React, { useEffect, useRef, useState, Fragment } from 'react';
import { useEasybase } from 'easybase-react';
import FocusWithin from 'react-focus-within';

const partsOfSpeech = [
  "adjective",
  "adverb",
  "greeting",
  "noun",
  "pronoun",
  "question-particle",
  "question-pronoun",
  "time-word",
  "verb",
];

function MainMenu() {
  return <div className="MainMenu"></div>;
}

function SearchBar(props) {
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
          {partsOfSpeech.map((pos, i) => <option value={pos} key={i}>{toTileCase(pos)}</option>)}
        </select>

        Fluency Level:
        <select value={fluencyLevel} onChange={(e) => setFluencyLevel(e.target.value)}>
          <option value="any">Any</option>
          <option value="needs practice">Needs Practice</option>
          <option value="fluent">Fluent</option>
        </select>

        <input type="text" value={searchText} onChange={(e) => setSearchText(e.target.value)} disabled={props.inEditMode} />

        <button
          onClick={(e) => props.handleSearch(e, searchText, searchLang, searchPOS, fluencyLevel)}
          disabled={props.inEditMode}
        >Go!</button>
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
  // The vocab list that gets rendered to the screen and the user interacts with
  const [vocabList, setVocabList] = useState(new Map());
  // Saved state of the vocab list before edit mode
  const preEditVocabList = useRef(new Map());
  // Copy of database to perform seraches on
  const fullVocabList = useRef(new Map());

  // tracks which entries have been deleted or changed in edit mode
  const [deletedEntries, setDeletedEntries] = useState(new Set());
  const [editedEntries, setEditedEntries] = useState(new Set());

  // tracks if user is in editMode
  const [inEditMode, setEditMode] = useState(false);

  // datatbase access
  const { db } = useEasybase();
  const TABLE = db("VOCAB");

  // ----------------------------------------
  // Database 
  // ----------------------------------------
  const fetchVocabList = async () => {
    const ebData = await TABLE.return().orderBy({ by: "pinyin", sort: "asc" }).all();

    const vocab = new Map();
    ebData.forEach((row) => {
      vocab.set(row._key, row);
    });

    fullVocabList.current = vocab;
    setVocabList(vocab);
    console.log("%cfetched vocab list", "color: yellow;");
  };

  const pushVocabList = async () => {

    let updated = 0;
    await Promise.all(Array.from(editedEntries).map(async (key) => {
      const entry = vocabList.get(key);
      updated += await TABLE.where({ _key: key }).set(entry).one();
    }));

    let deleted = 0;
    await Promise.all(Array.from(deletedEntries).map(async (key) => {
      deleted += await TABLE.delete().where({ _key: key }).one();
    }));

    if (editedEntries.size !== 0 || deletedEntries.size !== 0) {
      await fetchVocabList();
    }

    console.log("exiting edit mode:")
    console.log(`\tupdated ${updated} vocab entries`);
    console.log(`\tdeleted ${deleted} vocab entries`)
  }

  useEffect(() => {
    // initial db fetch
    fetchVocabList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------
  // Edit Mode Events
  // ----------------------------------------
  const handleEnterEditMode = () => {
    if (inEditMode) {
      return;
    }
    // entering edit mode, save a pristine copy of the vocabList
    preEditVocabList.current = cloneMap(vocabList);
    setEditMode(true);
    console.log("entering edit mode");
  }

  const handleSaveEdits = async () => {
    if (!inEditMode) {
      return;
    }

    // stupid dumb hack to block user input while db loads 
    const screenBlock = document.createElement("div");
    screenBlock.className += "overlay";
    document.body.appendChild(screenBlock);

    // update the database
    await pushVocabList();

    // clear the edit trackers
    preEditVocabList.current.clear();
    setEditedEntries(new Set());
    setDeletedEntries(new Set());

    // exit edit mode and remove the input blocker
    setEditMode(false);
    document.body.removeChild(screenBlock);
  }

  const handleCancelEdit = () => {
    if (!inEditMode) {
      console.error("wtf should only be accessible in edit mode");
      return;
    }

    console.log(`exiting edit mode:`);
    console.log(`\trestored ${deletedEntries.size} deleted entries`);
    console.log(`\trestored ${editedEntries.size} edited entries`);

    // restore the vocab list 
    const newVocabList = cloneMap(preEditVocabList.current);
    setVocabList(newVocabList);
    preEditVocabList.current.clear();

    // clear deleted and edited entries 
    setEditedEntries(new Set());
    setDeletedEntries(new Set());
    setEditMode(false);
  }

  // ----------------------------------------
  // VocabTable Edit Events
  // ----------------------------------------
  const handleDeleteEntryClick = (event) => {
    if (!inEditMode) {
      event.preventDefault();
      return;
    }

    const key = event.target.getAttribute("_key");
    if (editedEntries.has(key)) {
      setEditedEntries(new Set(editedEntries.delete(key)));
    }
    setDeletedEntries(new Set(deletedEntries).add(key));
  }

  const handleVocabUnfocus = (key) => {
    if (!inEditMode) {
      return;
    }
    const vocabEntry = vocabList.get(key);
    const pristineVocabEntry = preEditVocabList.current.get(key);

    // check if the vocab entry has been edited since the last push to the db
    if (JSON.stringify(vocabEntry) !== JSON.stringify(pristineVocabEntry)) {
      setEditedEntries(new Set(editedEntries.add(key)));
    } else {
      // if the entry was previously edited but is now pristine, remove it from the edited list
      if (editedEntries.has(key)) {
        setEditedEntries(new Set(editedEntries.delete(key)));
      }
    }
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
  // Search
  // ----------------------------------------
  const handleSearch = (event, text, language, partOfSpeech, fluencyLevel) => {
    event.preventDefault();
    if (inEditMode) {
      return
    };

    const needsPractice = (fluencyLevel !== "fluent") ? true : false;
    const result = new Map();
    fullVocabList.current.forEach((entry, key) => {
      if (
        (fluencyLevel === "any" || entry.needspractice === needsPractice)
        && (partOfSpeech === "any" || entry.partofspeech.match(new RegExp("\\b" + partOfSpeech + "(\\b|,)")))
        && entry[language].includes(text)
      ) {
        result.set(key, entry);
      }
    });

    console.log(Array.from(result.entries()));
  }

  // ----------------------------------------
  // Render
  // ----------------------------------------
  return (
    <div id="App">
      <SearchBar
        inEditMode={inEditMode}
        handleSearch={handleSearch}
      />
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
      <button onClick={inEditMode ? handleSaveEdits : handleEnterEditMode}>{inEditMode ? "Save" : "Edit"}</button>
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

const toTileCase = (str) => str.toLowerCase()
  .split(' ')
  .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
  .join(' ');

// const makeEnum = (arr) => {
//   let obj = {};
//   for (const val of arr) {
//     obj[val] = val;
//   }
//   return Object.freeze(obj);
// }

export default App;