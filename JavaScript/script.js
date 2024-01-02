let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
    // Ensure the input is a valid number
    if (isNaN(seconds)) {
      return "00:00";
    }
  
    // Convert seconds to minutes and seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60); // Truncate to the nearest integer
  
    // Format the result as mm:ss
    var formattedTime =
      (minutes < 10 ? "0" : "") + minutes + ":" + (remainingSeconds < 10 ? "0" : "") + remainingSeconds;
  
    return formattedTime;
  }

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let i = 0; i < as.length; i++) {
        const element = as[i];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    // Show all songs in the playlist
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<li> <img class="invert" src="./SVG's/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Mursaleen Nisar</div>
                            </div>
                            <div class="play-now">
                                <span>Play Now</span>
                                <img class="invert" src="./SVG's/play.svg" alt="">
                            </div> </li>`;
    }

    // Attach an event listener to each song
    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info div").innerHTML);
        });
    });

    return songs;

}

const playMusic = (track, pause=false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "./SVG's/pause.svg";
    }
    document.querySelector(".song-info").innerHTML = decodeURI(track);
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
}


async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors);
        for (let index = 0; index < array.length; index++) {
            const e = array[index];

        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            // Get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            let response = await a.json();
            document.querySelector(".card-container").innerHTML += `<div data-folder="${folder}" class="card">
            <div class="play">

                <svg width="23" height="23" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" fill="#000" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" />
                </svg>

            </div>
            <img src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div>`;
        }
    };

    // Load playlist whenever card is clicked
    document.querySelectorAll(".card").forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        });
    });

}


async function main() {
    // Get list of all songs
    await getSongs("songs/nasheeds");
    playMusic(songs[0], true);

    // Display all albums on document
    displayAlbums();


    // Attach an event listener to play, previous & next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "./SVG's/pause.svg";
        }
        else {
            currentSong.pause();
            play.src = "./SVG's/play.svg";
        }
    });


    // Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        // Play the seekbar
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%" ;
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Add an event listener to show hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    // Event listener for closing hamburger
    document.querySelector(".close img").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });

    // Event listener for previous button
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        if ((index-1) >= 0) {
            playMusic(songs[index-1]);
        }
    });

    // Event listener for next button
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1) [0]);
        if ((index+1) < songs.length) {
            playMusic(songs[index+1]);
        }
    });

    // Event listener for volume
    document.querySelector("#volume-bar").addEventListener("change", e => {
        currentSong.volume = e.target.value / 100;

        // Change icon on when muted
        if (e.target.value == 0) {
            document.querySelector(".volume img").src = "./SVG's/muted.svg";
        }
        else {
            document.querySelector(".volume img").src = "./SVG's/volume.svg";
        }
    });

    // Add event listener to mute the track
    document.querySelector(".volume > img").addEventListener("click", e => {
        if (e.target.src.includes("/SVG's/volume.svg")) {
            e.target.src = "./SVG's/muted.svg";
            currentSong.volume = 0;
            document.querySelector(".volume input").value = 0;
        }
        else {
            e.target.src = "./SVG's/volume.svg";
            currentSong.volume = 0.10;
            document.querySelector(".volume input").value = 10;
        }
    });


}
main();