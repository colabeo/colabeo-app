var disableNow = false;
var curCallID;
var curUrl = "";

var raw_html='<li class="user ui-btn ui-btn-icon-right ui-li-has-arrow ui-li ui-li-has-thumb ui-btn-up-c" browserid="[tag1]" data-corners="false" data-shadow="false" data-iconshadow="true" data-wrapperels="div" data-icon="arrow-r" data-iconpos="right" data-theme="c"><div class="ui-btn-inner ui-li"><div class="ui-btn-text"><a class="ui-link-inherit"><img src="[tag2]" class="ui-li-thumb"><h3 class="ui-li-heading">[tag3]</h3><p class="ui-li-desc">[tag4]</p><div class="socialbuttons"></div></a></div><span class="ui-icon ui-icon-arrow-r ui-icon-shadow">&nbsp;</span></div></li>';
var hardcoded_val={
    1508235435: '28BE7932-53F1-024F-063C-877712F6861F', //Chapman
    1508235449: '634FCA96-05A2-A7DB-2D6E-5BA7E5D50C9D', //Jeff
    1508235451: '5EEF475B-DB67-CC9C-235E-C49D29F96594', //Lap
    1508235450: 'C116FD42-F2B5-EE59-17A6-78F40F22221F',  //Shawn
    //new yammer app
    1508780839: '634FCA96-05A2-A7DB-2D6E-5BA7E5D50C9D',  //Jeff
    1508830799: 'C116FD42-F2B5-EE59-17A6-78F40F22221F',  //Shawn
    1508780770: '28BE7932-53F1-024F-063C-877712F6861F', //Chapman
};
var hardcoded_val2={
    1508235435: 'Chapman Hong',
    1508235449: 'Jeff Lin',
    1508235451: 'Lap Kuong Chan',
    1508235450: 'Shawn Wang',
    //new yammer app
    1508780839: 'Jeff Lin',
    1508830799: 'Shawn Wang',
    1508780770: 'Chapman Hong',
};

var userId = GetURLParameter('id');
console.log('userId: ' + userId);

var myID=hardcoded_val[userId];
var myName = hardcoded_val2[userId];


// [tag1]   -   browserID(berryID)
// [tag2]   -   image link
// [tag3]   -   full name
// [tag4]   -   description

function refleshContacts(people) {
    var html_content="";
    var index=0;
    for(var i in people) {  //enum people list and generate html content
        // console.log("var " + i+" = "+people[i]);
        var cooked_html='';
        var hardcoded_berryID=hardcoded_val[people[i].handle.yammer];
        if ( typeof hardcoded_berryID !== 'undefined' && hardcoded_berryID )
        {
            cooked_html=raw_html.replace("[tag1]", hardcoded_berryID);
        }
        else { cooked_html=raw_html.replace("[tag1]", "xxxxx"); }
        cooked_html=cooked_html.replace("[tag2]", people[i].avatar);
        cooked_html=cooked_html.replace("[tag3]", people[i].id);
        cooked_html=cooked_html.replace("[tag4]", people[i].description);
        html_content+=cooked_html;
        index++;
    }

    $("#contactlist").html(html_content);

    //register event
    $(".user").on('click', function(evt) {
        console.log('browserID: ' + $(evt.currentTarget).attr('browserID'));
        console.log('person: ' + $(evt.currentTarget).find(".ui-li-heading").text());
        curCallID = $(evt.currentTarget).attr('browserID');
        $('.incperson').text($(evt.currentTarget).find(".ui-li-heading").text());
        $('.incsocial').text("Yammer");
        $("#showPopup").click();
        call(curCallID);
    });
}

function BerryBase(FirebaseURL, userID) {
    this.Firebase=FirebaseURL;
    this.userID=userID;
    this.FirebaseRef=new Firebase(FirebaseURL);
    this.FirebaseUserRef=this.FirebaseRef.child('users');
    this.FirebaseMyRef=this.FirebaseUserRef.child(userID);
}

// callback will usually be the function thats altering html page
BerryBase.prototype.getContacts = function(callback)
{
    var self=this;
    this.ContactsRef = this.FirebaseMyRef.child('contacts');
    this.ContactsRef.on('value', function(snapshot) {
        if (snapshot.name()=='contacts') {
            console.log(snapshot.val());
            callback(snapshot.val());
        } else {
            console.log("On "+ self.userID + ", no contacts found!");
        }
    });
}

//=================================================================

function GetURLParameter(sParam) {

    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}


//register contact list click event
$(document).ready(function() {
    myBerry = new BerryBase('https://koalalab-berry.firebaseio.com/', userId);
    myBerry.getContacts(refleshContacts);

    $('.ui-input-text.ui-body-c').attr('placeholder', 'Welcome, ' + myName.split(' ')[0] + '!');

    $("#answer").on('click', function(evt) {
        answer();
    });

    $(".endBtn").on('click', function(evt) {
        removeVideoChat();
        if (curCallID)
            hangup(curCallID);
        curCallID = "";
    });
    setTimeout(function() {
        sendMessage("event", {data: {action:"syncID", id: myID, name: myName}});
    }, 3000);
    $(".syncBtn").on('click', function(evt) {
        sendMessage("event", {data: {action:"sync"}});
    });

    $("#acceptBtn").on('click', function() {
        setTimeout(answer, 600);
    });

    $("#declineBtn").on('click', function() {
        if (myID)
            hangup(myID);
    });

    $("#gotoBtn").on('click', function(evt) {
        var url = $('#url');
        if (url.val() != '') {
            sendMessage("event", {
                url : url.val(),
                action : 'urlChange'
            });
            $('.urlList ul').append('<li><a class="urlListBtn">' + url.val() + '</a></li>');
            $('.urlList ul').listview('refresh');
            url.val('');
        }
    });
});

//for jQuery mobile event
$(document).on('pageinit', function(e) {
    $("#url").keydown(function(e) {
        if (e.keyCode == 13) {
            $("#gotoBtn").click();
        }
    });

    $(".urlList").on('click', function(evt) {
        console.log(evt.target.text);
        demobo.mobile.fireInputEvent('gotoUrl', evt.target.text);
    });
});

function call(outgoingId) {
    var outgoingCallRef = new Firebase('https://de-berry.firebaseio-demo.com/call/' + outgoingId);
    outgoingCallRef.push({
        name : myID,
        person : myName
    });
    outgoingCallRef.on('child_removed', function(snapshot) {
        var callerId = snapshot.val()['name'];
        if (callerId == myID) {
            if ($('#popup:visible')[0] && !$('#chatContainer')[0])
                injectVideoChat(snapshot.name());
        } else {
            $(".endBtn").click();
        }
    });
}

function hangup(outgoingId) {
    var outgoingCallRef = new Firebase('https://de-berry.firebaseio-demo.com/call/' + outgoingId);
    outgoingCallRef.remove();
}
function answer() {
    var outgoingCallRef = new Firebase('https://de-berry.firebaseio-demo.com/call/' + myID);
    outgoingCallRef.remove();
    outgoingCallRef.on('child_removed', function(snapshot) {
        var roomID = snapshot.name();
        if ($('#popup:visible')[0] && !$('#chatContainer')[0]) {
            injectVideoChat(roomID);
        }
    });
}

function injectVideoChat(roomId) {
    if (!document.getElementById('chatContainer')) {
        var e = document.createElement('div');
        e.id = 'chatContainer';
        e.style.position = 'fixed';
        e.style.bottom = '30px';
        e.style.right = '0px';
        e.style.zIndex = '999';
        document.getElementById('popup').appendChild(e);
    }
    var i = document.createElement('iframe');
    i.src = 'https://koalabearate.appspot.com/?r=' + roomId;
    i.className = 'videoChatFrame';
    i.id = roomId;
    i.style.width = '100%';
    document.getElementById('chatContainer').appendChild(i);
}

function removeVideoChat() {
    $('#chatContainer').remove();
}

function sendMessage(type, data) {
    if (!demoboBody)
        return;
    var evt = new CustomEvent("FromKoala", {
        detail : {
            type : type,
            data : data
        }
    });
    demoboBody.dispatchEvent(evt);
}

function onExtensionMessage(e) {
    if (disableNow) return;
    console.log("onExtensionMessage: ", e.detail);
    if (e.detail.type == "urlUpdate") {
        curUrl = e.detail.data.url;
    }
    else if (e.detail.action == "incoming")	{
        setCallerInfo({fromPerson: e.detail.person, fromSocial: e.detail.social});
    }
    else if ($(".videoChatFrame")[0]) {
        $(".videoChatFrame")[0].contentWindow.postMessage(JSON.stringify(e.detail), "*");
    }
}

function onRemoteMessage(e) {
    var cmd = JSON.parse(evt.data);
    console.log("onRemoteMessage: ", e.detail);
}

addEventListener("message", function(e) {
    disableNow = true;
    setTimeout(function(){
        disableNow = false;
    },1000);
    var evt = JSON.parse(e.data);
    console.log("onRemoteMessage: ", evt);
    sendMessage("event", evt);
}, false);

function setCallerInfo(args) {
    $('.incperson').text(args.fromPerson);
    $('.incsocial').text(args.fromSocial);
    window.location = "#p";
}