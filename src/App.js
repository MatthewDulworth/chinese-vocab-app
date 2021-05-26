import './App.css';
import React, { useEffect, useState } from 'react';
import { useEasybase } from 'easybase-react';

function MainMenu(props) {
  return <div className="MainMenu"></div>;
}

function VocabHeader(props) {
  return (
    <tr>
      <td>Chinese (Simplified)</td>
      <td>Chinese (Traditional)</td>
      <td>Pinyin</td>
      <td>English</td>
      <td>Part of Seeech</td>
      <td>Notes</td>
      <td>Needs Practice</td>
    </tr>
  );
}

function VocabEntry(props) {
  return (
    <tr className="VocabEntry">
      <td className="chinese_simp">{props.chinesesimplified}</td>
      <td className="chinese_trad">{props.chinesetraditional}</td>
      <td className="pinyin">{props.pinyin}</td>
      <td className="english">{props.english}</td>
      <td className="part_of_speech">{props.partofspeech}</td>
      <td className="part_of_speech">{props.notes}</td>
      <td className="needs_practice">{props.needspractice ? "true" : "false"}</td>
    </tr>
  );
}

function VocabTable(props) {
  const tableBody = props.vocabList.map((vocabEntry) => {
    vocabEntry.key = vocabEntry._key;
    return React.createElement(VocabEntry, vocabEntry);
  });

  return (
    <table id="VocabTable">
      <thead>
        <VocabHeader />
      </thead>
      <tbody>
        {tableBody}
      </tbody>
    </table>
  );
}

function App() {
  const [vocabList, setEasybaseData] = useState([]);
  const { db } = useEasybase();

  useEffect(() => {
    async function mounted() {
      const ebData = await db("VOCAB").return().all();
      setEasybaseData(ebData);
    };
    mounted();
  }, []);

  return (
    <div className="App">
      <MainMenu />
      <VocabTable vocabList={vocabList} />
    </div>
  );
}

export default App;