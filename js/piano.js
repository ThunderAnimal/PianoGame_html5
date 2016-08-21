/**
 * Created by InSane on 13.08.2016.
 */
function PianoController () {
    var oNoteAllList = {};
    var oPianoGame = {};
    var oPianoSimple = {};
    var isPressed = false;
    var imgPath = "./img/note";
    var soundPath = "./sound";

    var init = function () {
        oNoteAllList = new NoteAllList(imgPath, soundPath);
        oPianoGame = new PianoGame();
        oPianoSimple = new PianoSimple(oNoteAllList);
    };

    var showSuccessPress = function(buttonId){
        var btn = $('#'+ buttonId);
        btn.addClass('success');
        setTimeout(function () {
            btn.removeClass('pressed success');
            setViewNextRound(oPianoGame.getNextRound());
        }, 1000);
    };
    var showErrPress = function (errBtnId, rightBtnId) {
        var btnFalse = $('#'+ errBtnId);
        var btnRight = $('#'+ rightBtnId);
        btnFalse.addClass('error');
        setTimeout(function () {
            new Audio(soundPath + "/error.mp3").play();
            btnRight.addClass('pressed success');
        },300);
        setTimeout(function () {
            btnFalse.removeClass('pressed error');
            btnRight.removeClass('pressed success');
            setViewNextRound(oPianoGame.getNextRound());
        }, 1000);
       
    };
    var setViewNextRound = function (oNote) {
        isPressed = false;
        if(oNote){
            setViewNextNote(oNote)
        }else{
            setViewEnd();
        }
    };
    var setViewNextNote = function (oNote) {
        $('.notePianoGame img').attr('src',oNote.imageUrl);
    };
    var setViewEnd = function () {
        $('.notePianoGame').hide();
        $('.endPianoGame .result').text(oPianoGame.getPoints());
        $('.endPianoGame .rounds').text(oPianoGame.getRounds());
        $('.endPianoGame .resultTime').text(Math.round(oPianoGame.getNeededTime()/1000));
        $('.endPianoGame').show();
    };

    this.pressPianoBtn = function (buttonId) {
        var button = $('#' + buttonId);

        if(isPressed && oPianoGame.isGameRunning())
            return false;

        isPressed = true;
        button.addClass('pressed');

        if(oPianoGame.isGameRunning()){
            new Audio(oPianoGame.getCurrentSound()).play();
            setTimeout(function () {
                if(oPianoGame.isCorrectPress(buttonId)){
                    showSuccessPress(buttonId);
                    oPianoGame.inkrementPoints();
                }else{
                    showErrPress(buttonId, oPianoGame.getCorrectPres());
                }
            },500);

        }else {
            new Audio(oPianoSimple.getNoteById(buttonId).soundUrl).play();
            setTimeout(function () {
                button.removeClass('pressed');
                isPressed = false;
            }, 500);

        }

    };
    this.startGame = function () {
        $('.startPianoGame').hide();
        $('.endPianoGame').hide();
        $('.notePianoGame').show();
        setViewNextRound(oPianoGame.startGame(10, oNoteAllList));
    };

    init();
}

function PianoSimple(oNoteListAll) {
    var noteList = [];

    var init = function (oNoteListAll) {
        noteList = oNoteListAll.getNoteListFromStringArray(["c1", "cis1", "d1", "es1", "e1", "f1", "fis1", "g1", "gis1", "a1", "b1", "h1"]);
    };

    this.getNoteById = function (buttonId) {
        switch (buttonId){
            case "white1": return noteList[0];
                break;
            case "black1": return noteList[1];
                break;
            case "white2": return noteList[2];
                break;
            case "black2": return noteList[3];
                break;
            case "white3": return noteList[4];
                break;
            case "white4": return noteList[5];
                break;
            case "black3": return noteList[6];
                break;
            case "white5": return noteList[7];
                break;
            case "black4": return noteList[8];
                break;
            case "white6": return noteList[9];
                break;
            case "black5": return noteList[10];
                break;
            case "white7": return noteList[11];
                break;
        }
    };

    init(oNoteListAll);
}

function PianoGame() {
    var gameRunning = false;
    var countRounds = 0;
    var currentRound = 0;
    var noteList = [];
    var points = 0;
    var startTime = 0;
    var neededTime = 0;

    var buildRandomIntArray = function (count, rangeMin, rangeMax) {
        var array = new Array(countRounds);
        var found;
        for(var i = 0; i < array.length; i++){
            do{
                array[i] = Math.round(Math.random() * (rangeMax - rangeMin) + rangeMin);
                found = false;
                for(var k = 0; k < i; k++){
                    if(array[i] === array[k]) {
                        found = true;
                        break;
                    }
                }
            } while (found);
        }
        return array;
    };

    this.isGameRunning = function () {
        return gameRunning;
    };
    this.startGame = function(rounds, oNoteListAll){
        gameRunning = true;
        points = 0;
        countRounds = rounds;

        //Build Random NoteList
        if(rounds > oNoteListAll.count()){
            console.error("To many Rounds.");
            return;
        }
        noteList = oNoteListAll.getNoteListFromIntArray(buildRandomIntArray(rounds, 0, oNoteListAll.count() - 1));
        startTime = Date.now();

        return this.getNextRound();
    };
    this.getCurrentSound = function () {
        return noteList[currentRound - 1].soundUrl;
    };
    this.getNextRound = function () {
        currentRound += 1;
        if(currentRound <= countRounds){
            return noteList[currentRound-1];
        }else{
            gameRunning = false;
            neededTime = Date.now() - startTime;
            return false;
        }

    };
    this.isCorrectPress = function (buttonId) {
        return buttonId === noteList[currentRound - 1].buttonId;
    };
    this.getCorrectPres = function () {
        return noteList[currentRound - 1].buttonId;
    };
    this.inkrementPoints = function () {
        points = points + 1;
    };
    this.getPoints = function () {
        return points;
    };
    this.getRounds = function () {
        return countRounds;
    };
    this.getNeededTime = function () {
        return neededTime;
    };
}

function NoteAllList(imageFolder, soundFolder) {
    var noteList = [];

    var init = function(imageFolder, soundFolder){
        noteList.push(new Note("c", "white1", imageFolder + "/C.png", soundFolder + "/p-36.mp3"));
        noteList.push(new Note("c_klein", "white1", imageFolder + "/c_klein.png", soundFolder + "/p-48.mp3"));
        noteList.push(new Note("c1", "white1", imageFolder + "/c1.png", soundFolder + "/p-60.mp3"));
        noteList.push(new Note("c2", "white1", imageFolder + "/c2.png", soundFolder + "/p-72.mp3"));

        noteList.push(new Note("d", "white2", imageFolder + "/D.png", soundFolder + "/p-38.mp3"));
        noteList.push(new Note("d_klein", "white2", imageFolder + "/d_klein.png", soundFolder + "/p-50.mp3"));
        noteList.push(new Note("d1", "white2", imageFolder + "/d1.png", soundFolder + "/p-62.mp3"));
        noteList.push(new Note("d2", "white2", imageFolder + "/d2.png", soundFolder + "/p-74.mp3"));

        noteList.push(new Note("e", "white3", imageFolder + "/E.png", soundFolder + "/p-40.mp3"));
        noteList.push(new Note("e_klein", "white3", imageFolder + "/e_klein.png", soundFolder + "/p-52.mp3"));
        noteList.push(new Note("e1", "white3", imageFolder + "/e1.png", soundFolder + "/p-64.mp3"));
        noteList.push(new Note("e2", "white3", imageFolder + "/e2.png", soundFolder + "/p-76.mp3"));

        noteList.push(new Note("f", "white4", imageFolder + "/F.png", soundFolder + "/p-41.mp3"));
        noteList.push(new Note("f_klein", "white4", imageFolder + "/f_klein.png", soundFolder + "/p-53.mp3"));
        noteList.push(new Note("f1", "white4", imageFolder + "/f1.png", soundFolder + "/p-65.mp3"));
        noteList.push(new Note("f2", "white4", imageFolder + "/f2.png", soundFolder + "/p-77.mp3"));

        noteList.push(new Note("g", "white5", imageFolder + "/G.png", soundFolder + "/p-43.mp3"));
        noteList.push(new Note("g_klein", "white5", imageFolder + "/g_klein.png", soundFolder + "/p-55.mp3"));
        noteList.push(new Note("g1", "white5", imageFolder + "/g1.png", soundFolder + "/p-67.mp3"));
        noteList.push(new Note("g2", "white5", imageFolder + "/g2.png", soundFolder + "/p-79.mp3"));

        noteList.push(new Note("a", "white6", imageFolder + "/A.png", soundFolder + "/p-45.mp3"));
        noteList.push(new Note("a_klein", "white6", imageFolder + "/a_klein.png", soundFolder + "/p-57.mp3"));
        noteList.push(new Note("a1", "white6", imageFolder + "/a1.png", soundFolder + "/p-69.mp3"));
        noteList.push(new Note("a2", "white6", imageFolder + "/a2.png", soundFolder + "/p-81.mp3"));

        noteList.push(new Note("h", "white7", imageFolder + "/H.png", soundFolder + "/p-47.mp3"));
        noteList.push(new Note("h_klein", "white7", imageFolder + "/h_klein.png", soundFolder + "/p-59.mp3"));
        noteList.push(new Note("h1", "white7", imageFolder + "/h1.png", soundFolder + "/p-71.mp3"));
        noteList.push(new Note("h2", "white7", imageFolder + "/h2.png", soundFolder + "/p-83.mp3"));

        noteList.push(new Note("cis", "black1", imageFolder + "/CIS.png", soundFolder + "/p-37.mp3"));
        noteList.push(new Note("cis_klein", "black1", imageFolder + "/cis_klein.png", soundFolder + "/p-49.mp3"));
        noteList.push(new Note("cis1", "black1", imageFolder + "/cis1.png", soundFolder + "/p-61.mp3"));
        noteList.push(new Note("cis2", "black1", imageFolder + "/cis2.png", soundFolder + "/p-73.mp3"));
        noteList.push(new Note("des", "black1", imageFolder + "/DES.png", soundFolder + "/p-37.mp3"));
        noteList.push(new Note("des_klein", "black1", imageFolder + "/des_klein.png", soundFolder + "/p-49.mp3"));
        noteList.push(new Note("des1", "black1", imageFolder + "/des1.png", soundFolder + "/p-61.mp3"));
        noteList.push(new Note("des2", "black1", imageFolder + "/des2.png", soundFolder + "//p-73.mp3"));

        noteList.push(new Note("dis", "black2", imageFolder + "/DIS.png", soundFolder + "/p-39.mp3"));
        noteList.push(new Note("dis_klein", "black2", imageFolder + "/dis_klein.png", soundFolder + "/p-51.mp3"));
        noteList.push(new Note("dis1", "black2", imageFolder + "/dis1.png", soundFolder + "/p-63.mp3"));
        noteList.push(new Note("dis2", "black2", imageFolder + "/dis2.png", soundFolder + "/p-75.mp3"));
        noteList.push(new Note("es", "black2", imageFolder + "/ES.png", soundFolder + "/p-39.mp3"));
        noteList.push(new Note("es_klein", "black2", imageFolder + "/es_klein.png", soundFolder + "/p-51.mp3"));
        noteList.push(new Note("es1", "black2", imageFolder + "/es1.png", soundFolder + "/p-63.mp3"));
        noteList.push(new Note("es2", "black2", imageFolder + "/es2.png", soundFolder + "/p-75.mp3"));

        noteList.push(new Note("fis", "black3", imageFolder + "/FIS.png", soundFolder + "/p-42.mp3"));
        noteList.push(new Note("fis_klein", "black3", imageFolder + "/fis_klein.png", soundFolder + "/p-54.mp3"));
        noteList.push(new Note("fis1", "black3", imageFolder + "/fis1.png", soundFolder + "/p-66.mp3"));
        noteList.push(new Note("fis2", "black3", imageFolder + "/fis2.png", soundFolder + "/p-78.mp3"));
        noteList.push(new Note("ges", "black3", imageFolder + "/GES.png", soundFolder + "/p-42.mp3"));
        noteList.push(new Note("ges_klein", "black3", imageFolder + "/ges_klein.png", soundFolder + "/p-54.mp3"));
        noteList.push(new Note("ges1", "black3", imageFolder + "/ges1.png", soundFolder + "/p-66.mp3"));
        noteList.push(new Note("ges2", "black3", imageFolder + "/ges2.png", soundFolder + "/p-78.mp3"));

        noteList.push(new Note("as", "black4", imageFolder + "/AS.png", soundFolder + "/p-44.mp3"));
        noteList.push(new Note("as_klein", "black4", imageFolder + "/as_klein.png", soundFolder + "/p-56.mp3"));
        noteList.push(new Note("as1", "black4", imageFolder + "/as1.png", soundFolder + "/p-68.mp3"));
        noteList.push(new Note("as2", "black4", imageFolder + "/as2.png", soundFolder + "/p-80.mp3"));
        noteList.push(new Note("gis", "black4", imageFolder + "/GIS.png", soundFolder + "/p-44.mp3"));
        noteList.push(new Note("gis_klein", "black4", imageFolder + "/gis_klein.png", soundFolder + "/p-56.mp3"));
        noteList.push(new Note("gis1", "black4", imageFolder + "/gis1.png", soundFolder + "/p-68.mp3"));
        noteList.push(new Note("gis2", "black4", imageFolder + "/gis2.png", soundFolder + "/p-80.mp3"));

        noteList.push(new Note("ais", "black5", imageFolder + "/AIS.png", soundFolder + "/p-46.mp3"));
        noteList.push(new Note("ais_klein", "black5", imageFolder + "/ais_klein.png", soundFolder + "/p-58.mp3"));
        noteList.push(new Note("ais1", "black5", imageFolder + "/ais1.png", soundFolder + "/p-70.mp3"));
        noteList.push(new Note("ais2", "black5", imageFolder + "/ais2.png", soundFolder + "/p-82.mp3"));
        noteList.push(new Note("b", "black5", imageFolder + "/B.png", soundFolder + "/p-46.mp3"));
        noteList.push(new Note("b_klein", "black5", imageFolder + "/b_klein.png", soundFolder + "/p-58.mp3"));
        noteList.push(new Note("b1", "black5", imageFolder + "/b1.png", soundFolder + "/p-70.mp3"));
        noteList.push(new Note("b2", "black5", imageFolder + "/b2.png", soundFolder + "/p-82.mp3"));
    };

    this.count = function () {
        return noteList.length;
    };
    this.getNoteListFromIntArray = function (array) {
        var noteNewList = [];
        for(var i = 0; i < array.length; i++){
            noteNewList.push(noteList[array[i]]);
        }
        return noteNewList;
    };
    this.getNoteListFromStringArray = function (array) {
        var noteNewList = [];
        for (var i = 0; i < array.length; i++){
            for(var k = 0; k < noteList.length; k++){
                if(noteList[k].name == array[i]){
                    noteNewList.push(noteList[k]);
                    break;
                }
            }
        }
        return noteNewList;
    };

    init(imageFolder, soundFolder);
}

function Note(name, buttonId, imageUrl, soundUrl){
    this.name = name;
    this.buttonId = buttonId;
    this.imageUrl = imageUrl;
    this.soundUrl = soundUrl;
}
