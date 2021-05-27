import './App.css';
import React, { useEffect, useState } from 'react';
import { useEasybase } from 'easybase-react';

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
    <form className="VocabEntry" spellCheck="false">
      <input type="text" onChange={doCellChange} className="chinesesimplified" value={props.chinesesimplified} />
      <input type="text" onChange={doCellChange} className="chinesetraditional" value={props.chinesetraditional} />
      <input type="text" onChange={doCellChange} className="pinyin" value={props.pinyin} />
      <input type="text" onChange={doCellChange} className="english" value={props.english} spellCheck="true"/>
      <input type="text" onChange={doCellChange} className="partofspeech" value={props.partofspeech} spellCheck="true"/>
      <input type="checkbox" onChange={doCellChange} className="needspractice" checked={props.needspractice} />
      <input type="text" onChange={doCellChange} className="notes" value={props.notes ? props.notes : ""} />
    </form>
  );
}

function VocabTable(props) {
  const tableBody = props.vocabList.map((vocabEntry, index) => {
    return React.createElement(VocabEntry, {
      ...vocabEntry,
      key: vocabEntry._key,
      handleCellChange: props.handleCellChange,
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

function AddVocabDialouge({ fetchVocabList }) {
  const [vocabEntry, setVocabEntry] = useState({ needspractice: false });
  const { db } = useEasybase();

  const handleChange = (event) => {
    const updatedEntry = { ...vocabEntry };
    if (event.target.type === "checkbox") {
      updatedEntry[event.target.className] = event.target.checked;
    } else {
      updatedEntry[event.target.className] = event.target.value;
    }
    setVocabEntry(updatedEntry);
    console.log(vocabEntry);
  }

  const submitEntry = async (event) => {
    event.preventDefault();
    const recs = await db("VOCAB").insert(vocabEntry).one();
    fetchVocabList();
    console.log(`%c submitted ${recs} vocab entry(ies)`, "color: blue", vocabEntry);
  }

  return (
    <div id="AddVocabDialouge">
      <form spellCheck="false">
        Chinese (Simplified)
        <input type="text" onChange={handleChange} defaultValue="" className="chinesesimplified" />
        Chinese (Traditional)
        <input type="text" onChange={handleChange} defaultValue="" className="chinesetraditional" />
        Pinyin
        <input type="text" onChange={handleChange} defaultValue="" className="pinyin" />
        English
        <input type="text" onChange={handleChange} defaultValue="" className="english" spellCheck="true"/>
        Part of Speech
        <input type="text" onChange={handleChange} defaultValue="" className="partofspeech" spellCheck="true"/>
        Needs Practice?
        <input type="checkbox" onChange={handleChange} className="needspractice" />
        Notes
        <input type="text" onChange={handleChange} defaultValue="" className="notes" />
        <input type="submit" onClick={submitEntry} />
      </form>
    </div>
  );
}

function AddVocabButton() {
  const handleClick = async () => {

  }
  return <button onClick={handleClick}>Add Vocab Entry</button>
}

function App() {
  const [inEditMode, setEditMode] = useState(false);
  const [vocabList, setVocabList] = useState([]);
  const { db } = useEasybase();

  async function fetchVocabList() {
    const ebData = await db("VOCAB").return().all();
    setVocabList(ebData);
    console.log("%cfetched vocab list", "color: yellow;");
  };

  useEffect(() => {
    fetchVocabList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleEditMode = (event) => {
    console.log(`${inEditMode ? "exiting edit mode" : "entering edit mode"}`);
    setEditMode(!inEditMode);
  }

  const handleCellChange = (event, entryIndex) => {
    if(!inEditMode) {
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

  return (
    <div id="App">
      <MainMenu />
      <VocabTable vocabList={vocabList} handleCellChange={handleCellChange}></VocabTable>
      <button onClick={fetchVocabList}>Fetch Data</button>
      <button onClick={handleEditMode}>{inEditMode ? "Save" : "Edit"}</button>
      <AddVocabButton fetchVocabList={fetchVocabList} />
      <AddVocabDialouge fetchVocabList={fetchVocabList} />
    </div>
  );
}

export default App;