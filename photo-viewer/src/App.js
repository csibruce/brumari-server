import _ from 'lodash';
import React, { Component } from 'react';
import io from 'socket.io-client'
import request from 'superagent';
import logo from './logo.svg';
import './App.css';


let socket = io(`http://localhost:8088`);

const getJson = (json) => {
  let result = undefined;
  try {
    result = JSON.parse(json);
  } catch (e) {
    result = {}
  }
  return result
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      photos: [],
    }

    this.onLoading = false;
  }

  componentDidMount() {
    console.log('componentDidMount');
    socket.on('photo_added', this.addPhoto.bind(this));
  }

  addPhoto(photo) {
    const { photos } = this.state;
    console.log(photo);
    console.log(getJson(photo));
    const item = (typeof photo === 'object') ? photo : getJson(photo)
    const addedPhotos = _.concat(photos, item);
    this.setState({
      photos: addedPhotos,
    })
  }

  getPhotos() {
    request
      .get('//localhost:8088/list')
      .set('Accept', 'application/json')
      .end((err, res) => {
        if (res.statusCode !== 200) return alert('리스트를 불러오지 못했습니다.')
        const result = (res.text) ? getJson(res.text) : null;
        const photos = result && result.Contents
        console.log({ photos });
        this.photoSize = photos.length || 0;
        this.photoCounter = 0;

        if (!photos[this.photoCounter]) return;
        this.setter = setInterval(() => {
          this.addPhoto(photos[this.photoCounter]);
          this.photoCounter = this.photoCounter + 1;
          if (this.photoCounter === this.photoSize) {
            this.photoSize = 0;
            this.photoCounter = 0;
            clearInterval(this.setter);
          }
        }, 500)
      });
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <button
            className="button"
            onClick={this.getPhotos.bind(this)}
          >
            get list
          </button>
        </div>
        <div className="item-box">
          {this.state.photos && _.map(this.state.photos, (photo, idx) => {
            return (
              <img
                className="item"
                key={`${photo.ETag}-${idx}`}
                src={`https://s3.ap-northeast-2.amazonaws.com/brumari/${photo.Key}`}
                width="200px"
                height="200px"
              />
            )
          })}
        </div>
      </div>
    );
  }
}

export default App;
