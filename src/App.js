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
    <form className="VocabEntry">
      <input type="text" onChange={doCellChange} className="chinesesimplified"  value={props.chinesesimplified}/> 
      <input type="text" onChange={doCellChange} className="chinesetraditional" value={props.chinesetraditional}/>
      <input type="text" onChange={doCellChange} className="pinyin"             value={props.pinyin}/>
      <input type="text" onChange={doCellChange} className="english"            value={props.english}/>
      <input type="text" onChange={doCellChange} className="partofspeech"       value={props.partofspeech}/>
      <input type="text" onChange={doCellChange} className="needspractice"      value={props.needspractice ? "true" : "false"}/>
      <input type="text" onChange={doCellChange} className="notes"              value={props.notes ? props.notes : ""}/>
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

function App() {
  const [vocabList, setVocabList] = useState([]);
  const { db } = useEasybase();

  async function fetchVocabList() {
    const ebData = await db("VOCAB").return().all();
    setVocabList(ebData);
    console.log("%cfetched vocab list", "color: yellow;");
  };

  useEffect(() => {
    fetchVocabList();
  }, []);

  const handleCellChange = (event, entryIndex) => {
    const newVocabList = vocabList.splice(0);
    const targetObj = newVocabList[entryIndex];
    targetObj[event.target.className] = event.target.value;
    setVocabList(newVocabList);
  }

  return (
    <div id="App">
      <MainMenu />
      <VocabTable vocabList={vocabList} handleCellChange={handleCellChange}></VocabTable>
      <button onClick={fetchVocabList}>Fetch Data</button>
    </div>
  );
}

export default App;