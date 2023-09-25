const musicLibsContainer = document.getElementById('songs');
const musicPlayer = document.getElementById('music-player');
const currentSongObj = {};
const songQueue = [];
let currentSongIndex = -1;

window.addEventListener('load', bootupApp);

function bootupApp() {
  fetchAndRenderAllSections();
}

function fetchAndRenderAllSections() {
  fetch('/JS/gaana.json')
    .then((res) => res.json())
    .then((res) => {
      const { cardbox } = res;
      if (Array.isArray(cardbox) && cardbox.length) {
        cardbox.forEach((section) => {
          const { songsbox, songscards } = section;
          renderSection(songsbox, songscards);
        });
      }
    });
}

function renderSection(title, songsList) {
  const songsSection = makeSectionDom(title, songsList);
  musicLibsContainer.appendChild(songsSection);
}

function makeSectionDom(title, songsList) {
  const sectionDiv = document.createElement('div');
  sectionDiv.className = 'songs-section';
  sectionDiv.innerHTML = `
    <div class="card-head">
      <h1>${title}</h1>
      <a href="#">See All</a>
    </div>
    <div class="song-cards-container">
      ${songsList.map((songObj) => buildSongCardDom(songObj)).join('')}
    </div>
  `;

  return sectionDiv;
}

function buildSongCardDom(songObj) {
  return `
    <div class="song-card" onclick="playSong(this)" data-songobj='${JSON.stringify(songObj)}'>
      <div class="song-image">
        <img src="/${songObj.image_source}" alt="${songObj.song_name}">
      </div>
      <a class="song-name" href="#">${songObj.song_name}</a>
    </div>
  `;
}


function playSong(songCardEl) {
  const player = document.getElementById('music-player-container');
  const songObj = JSON.parse(songCardEl.dataset.songobj);
  const songCards = Array.from(songCardEl.parentElement.querySelectorAll('.song-card'));
  
  // Clear the current song queue and add all songs from the song card
  songQueue.length = 0;
  songQueue.push(...songCards.map(card => JSON.parse(card.dataset.songobj)));

  // Find the index of the selected song in the queue
  currentSongIndex = songQueue.findIndex(song => song.song_name === songObj.song_name);

  setAndPlayCurrentSong();
  player.style.visibility = 'visible';

}


function enqueueSong(songObj) {
  songQueue.push(songObj);
}

function setAndPlayCurrentSong() {
  if (currentSongIndex < 0) {
    // Start playing from the beginning of the queue
    currentSongIndex = 0;
  } else if (currentSongIndex >= songQueue.length) {
    // Wrap around to the first song in the queue
    currentSongIndex = 0;
  }

  const currentSong = songQueue[currentSongIndex];
  currentSongObj.songObj = currentSong;
  musicPlayer.pause();
  musicPlayer.src = currentSong.quality.low;
  musicPlayer.addEventListener('loadedmetadata', onAudioLoaded);
}

function onAudioLoaded() {
  musicPlayer.play();
  musicPlayer.removeEventListener('loadedmetadata', onAudioLoaded);
  updatePlayerUi(currentSongObj.songObj);
}

function updatePlayerUi(songObj) {
  const songName = document.getElementById('current-song-name');
  const songImg = document.getElementById('current-song-img');
  const songStartTime = document.getElementById('song-start-time');
  const songCurrTime = document.getElementById('song-current-time');
  const playButton = document.getElementById('play');
  const pauseButton = document.getElementById('pause');

  songName.innerHTML = songObj.song_name;
  songImg.src = songObj.image_source;

  songStartTime.innerHTML = formatTime(musicPlayer.currentTime);
  songCurrTime.innerHTML = formatTime(musicPlayer.duration);

  pauseButton.style.visibility = 'visible';
  playButton.style.visibility = 'hidden';
}

function togglePlayer() {
  const playButton = document.getElementById('play');
  const pauseButton = document.getElementById('pause');

  if (musicPlayer.paused) {
    musicPlayer.play();
    pauseButton.style.visibility = 'visible';
    playButton.style.visibility = 'hidden';
  } else {
    musicPlayer.pause();
    pauseButton.style.visibility = 'hidden';
    playButton.style.visibility = 'visible';
  }
}

musicPlayer.addEventListener('timeupdate', updatePlayerTime);

function updatePlayerTime() {
  const songStartTime = document.getElementById('song-start-time');
  const songCurrTime = document.getElementById('song-current-time');

  if (!musicPlayer || musicPlayer.paused) return;

  songStartTime.innerHTML = formatTime(musicPlayer.currentTime);
  songCurrTime.innerHTML = formatTime(musicPlayer.duration);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime;
}

function playPreviousSong() {
  currentSongIndex--;
  console.log(currentSongIndex)
  setAndPlayCurrentSong();
}
 



function playNextSong() {
  currentSongIndex++;
  if (currentSongIndex >= songQueue.length) {
    currentSongIndex = 0; // Wrap around to the first song in the queue
  }
  setAndPlayCurrentSong();
}



// SEARCH-BAR


document.addEventListener("DOMContentLoaded", function () {
  const searchInputButton = document.getElementById('search-button');
  const searchInputDiv = document.getElementById('search-input-div');
  const searchInput = document.getElementById('text-search');
  const songList = document.querySelectorAll(".song-card"); // Ensure this selector is correct
  const ul = document.getElementById('search-list'); // Create a new ul element for search results
  const noSongsFound = document.createElement('li');
  noSongsFound.textContent = "No songs found";

  // Add click event listener to the search input button
  searchInputButton.addEventListener("click", function () {
    searchInputDiv.style.display = "block";
  });

  // Add input event listener to the search input field
  searchInput.addEventListener("input", function () {

    const searchText = searchInput.value.toLowerCase();
    ul.innerHTML = ""; // Clear the previous search results

    if (searchText === "") {
      // Hide the search results if the search input is empty
      ul.style.display = "none";
      return;
    }

    let songsFound = false;

    // Filter the songs based on the search text
    songList.forEach((item) => {
      const songName = item.querySelector(".artist-name").textContent.toLowerCase();
      if (songName.includes(searchText)) {
        const li = document.createElement('li');
        li.textContent = songName;
        ul.appendChild(li);
        songsFound = true;
      }
    });

    if (!songsFound) {
      ul.appendChild(noSongsFound); // Append the "No songs found" message
    }
    
    ul.style.display = "block"; // Show the search results

  });
});




//music end automaticaLLY PLAY NEXT SONG
musicPlayer.addEventListener('ended', playNextSong);

//progress bar
musicPlayer.addEventListener('timeupdate', updatePlayerTime);

function updatePlayerTime() {
  const songStartTime = document.getElementById('song-start-time');
  const songCurrTime = document.getElementById('song-current-time');
  const progressBar = document.getElementById('progress-bar');

  if (!musicPlayer || musicPlayer.paused) return;

  songStartTime.innerHTML = formatTime(musicPlayer.currentTime);
  songCurrTime.innerHTML = formatTime(musicPlayer.duration);

  // Update the progress bar width based on the current time and duration
  const progress = (musicPlayer.currentTime / musicPlayer.duration) * 100;
  progressBar.style.width = progress + '%';
}


const progressBarContainer = document.getElementById('progress-bar-container');
progressBarContainer.addEventListener('click', seekTo);

function seekTo(event) {
  // Calculate the percentage of the click relative to the progress bar container
  const clickX = event.clientX - progressBarContainer.getBoundingClientRect().left;
  const progressBarWidth = progressBarContainer.clientWidth;
  const seekPercentage = (clickX / progressBarWidth) * 100;

  // Calculate the new time to seek to based on the percentage
  const newTime = (seekPercentage / 100) * musicPlayer.duration;

  // Set the new time and play from that point
  musicPlayer.currentTime = newTime;
  musicPlayer.play();
}

