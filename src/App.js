import './App.css';
import React from 'react';
import { EasybaseProvider } from 'easybase-react';
import ebconfig from './ebconfig';

const dummyData = [
  { key: 1, chineseSimp: "我", chineseTrad: "我", pinyin: "wǒ", english: "I/me", partOfSpeech: "noun", needsPractice: false },
  { key: 2, chineseSimp: "是", chineseTrad: "是", pinyin: "shì", english: "is/to be", partOfSpeech: "verb", needsPractice: false },
  { key: 3, chineseSimp: "现在", chineseTrad: "現在", pinyin: "xiànzài", english: "now", partOfSpeech: "time word", needsPractice: true }
];

function MainMenu(props) {
  return <div className="MainMenu"></div>;
}

function VocabEntry(props) {
  return (
    <tr className="VocabEntry">
      <td className="chinese_simp">{props.chineseSimp}</td>
      <td className="chinese_trad">{props.chineseTrad}</td>
      <td className="pinyin">{props.pinyin}</td>
      <td className="english">{props.english}</td>
      <td className="part_of_speech">{props.partOfSpeech}</td>
      <td className="needs_practice">{props.needsPractice ? "true" : "false"}</td>
    </tr>
  );
}

class VocabTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      vocab: dummyData
    }
  }

  renderTableHeader() {
    const header = Object.keys(this.state.vocab[0]);
    const entries = header.map((key, index) => <th key={index}>{key.toUpperCase()}</th>).slice(1);
    return <tr>{entries}</tr>
  }

  render() {
    const entries = this.state.vocab.map((entry) => React.createElement(VocabEntry, entry));
    const tableHeader = this.renderTableHeader();

    return (
      <table id="VocabTable">
        <thead>
          {tableHeader}
        </thead>
        <tbody>
          {entries}
        </tbody>
      </table>
    );
  }
}

function App() {
  return (
    <EasybaseProvider ebconfig={ebconfig}>
      <div className="App">
        <MainMenu />
        <VocabTable />
      </div>
    </EasybaseProvider>
  );
}

export default App;