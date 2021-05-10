var url_string = window.location.href;
var url = new URL(url_string);
var id = url.searchParams.get('id');
document.getElementById('logas').innerHTML = "Login As " + id;


// seleksi elemen video
var video = document.querySelector("#video");

// minta izin user
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

// jika user memberikan izin
if (navigator.getUserMedia) {
    // jalankan fungsi handleVideo, dan videoError jika izin ditolak
    navigator.getUserMedia({ video: true }, handleVideo, videoError);
}

// fungsi ini akan dieksekusi jika  izin telah diberikan
function handleVideo(stream) {
    video.srcObject = stream;
}

// fungsi ini akan dieksekusi kalau user menolak izin
function videoError(e) {
    // do something
    alert("Izinkan menggunakan webcam untuk demo!")
}

function takeSnapshot() {
    // buat elemen img
    var img = document.createElement('img');
    img.setAttribute('id', 'imageUpload')
    var context;

    // ambil ukuran video
    var width = video.offsetWidth
        , height = video.offsetHeight;

    // buat elemen canvas
    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    // ambil gambar dari video dan masukan 
    // ke dalam canvas
    context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, width, height);

    // render hasil dari canvas ke elemen img
    img.src = canvas.toDataURL('image/jpg');
    document.body.appendChild(img);


    video.src = "";

    add_data();

    scanning();

}

function add_data() {
    var ids = Math.floor(Math.random() * 100000);

    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;

    var tanggal = dateTime;
    var orang = id;
    var database = firebase.database();
    firebase.database().ref('login/' + ids).set({
        orang: orang,
        tanggal: tanggal
    });
}

function scanning() {
    Promise.all([
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('/models')
    ]).then(start);


    async function start() {
        const image = document.getElementById("imageUpload");
        const container = document.createElement('div')
        container.style.position = 'relative'
        document.body.append(container)
        const labeledFaceDescriptors = await loadLabeledImages()
        const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6)

        document.body.append('Loaded')
        container.append(image)
        const canvas = faceapi.createCanvasFromMedia(image)
        container.append(canvas)
        const displaySize = { width: image.width, height: image.height }
        faceapi.matchDimensions(canvas, displaySize)
        const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
        const resizedDetections = faceapi.resizeResults(detections, displaySize)
        const results = resizedDetections.map(d => faceMatcher.findBestMatch(d.descriptor))
        results.forEach((result, i) => {
            const box = resizedDetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, { label: result.toString() })
            drawBox.draw(canvas)
        })

    }

    function loadLabeledImages() {
        const labels = ['Andika']
        const faceDescriptors = []
        return Promise.all(
            labels.map(async label => {
                for (let i = 1; i <= 2; i++) {
                    const img = await faceapi.fetchImage(`/labeled_images/${label}/${i}.png`)
                    const fullFaceDescription = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()

                    if (!fullFaceDescription) {
                        throw new Error(`no faces detected for ${label}`)
                    }
                    faceDescriptors.push(fullFaceDescription.descriptor)
                }

                return new faceapi.LabeledFaceDescriptors(label, faceDescriptors)
            })
        )
    }
    // Getting Info And Get Location 
    getlocation();

}

function getlocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        x.innerHTML = "Geolocation is not supported by this browser.";
    }
}



function showPosition(position) {
    var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var latlon = new google.maps.LatLng(lat, lon)
    var mapholder = document.getElementById('mapholder')
    mapholder.style.height = '250px';
    mapholder.style.width = '100%';

    var myOptions = {
        center: latlon, zoom: 14,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        navigationControlOptions: { style: google.maps.NavigationControlStyle.SMALL }
    };
    var map = new google.maps.Map(document.getElementById("mapholder"), myOptions);
    var marker = new google.maps.Marker({ position: latlon, map: map, title: "You are here!" });
    x.innerHTML = "Latitude = " + position.coords.latitude + " Longitude = " + position.coords.longitude;
}
