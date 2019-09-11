const audio = document.querySelector('audio');
const actx  = Tone.context;
const dest  = actx.createMediaStreamDestination();
const recorder = new MediaRecorder(dest.stream);
const chunks = [];
let index=0;
let counter = 0;
var rec=false;
var flag= false;
var edit = false;
var sequencer;
var liCss;
var link;
var blob;
var base64data;

$('.save-button').removeAttr('id');
$('.delete-button').remove();
$("#title").val('');
$('.modal-title').text('Add Creation');
$('.onoffswitch-checkbox').prop('checked', false);

$("#new-button").on("click",function(){
    window.location.replace('/composer');
});

window.onload= function(){
    sequencer = new Nexus.Sequencer('#grid',{
    'size': [850,300],
    'mode': 'toggle',
    'rows': 5,
    'columns': 16
    });
    sequencer.colorize("accent","#4DF3CE");
    $("#add-button").text('Add');

    /* PLAY/PAUSE BUTTON */ 
    var pause=false;
    $("#play-pause-button").on('click',function(){
        if(pause==false){
            $("#play-pause-button").empty();
            $("#play-pause-button").append("<i class='fas fa-pause'><i>")
            Tone.Transport.start();
            pause=true;
        }
        else{
            $("#play-pause-button").empty();
            $("#play-pause-button").append("<i class='fas fa-play'><i>")
            Tone.Transport.stop();
            pause=false;
        }
    });

    /*Stop button*/
    $("#stop-button").off().on('click',function(){
        if(pause==true){
            $("#play-pause-button").empty();
            $("#play-pause-button").append("<i class='fas fa-play'><i>")
            $("#play-pause-button").hover(function() {
            $(this).css("color","#20db20")
            });
            pause=false;
            Tone.Transport.stop();
        }
        Tone.Transport.stop();
        Tone.Transport.start();
        for(let j=0;j<16;j++){
            if(index%16==0)
                break;
            sequencer.next();
            index++;
        }
        flag=false;
        index=0;
        Tone.Transport.stop();
    });
    
    /*SAVE BUTTON */
    $(".save-button").on('click',function(){
        var isvalidate = $("form")[0].checkValidity();
        if(isvalidate) {
            event.preventDefault();
            if(pause==true){
                $("#play-pause-button").empty();
                $("#play-pause-button").append("<i class='fas fa-play'><i>");
                pause=false;
                Tone.Transport.stop();
            }

            let beats = new Array(sequencer.rows);
            let bpm = $('#bpm').val();
            const title = $("#title").val();
            let privacy = $('.onoffswitch-checkbox').is(":checked");
            for(let i=0;i<sequencer.columns;i++)
                beats[i]=[];
            for(let i=0;i<sequencer.rows;i++){
                for(let j=0;j<sequencer.columns;j++){
                    if(sequencer.matrix.pattern[i][j] === false)
                        beats[i][j] = 0;
                    else
                        beats[i][j]=1;
                }
            }                   
            
            var data = {
                title: title,
                beats: beats,
                bpm:bpm,
                privacy:privacy,
                link:base64data
            }
     
            if(edit==false){
                $.ajax({
                    url:'/composer/add',
                    type: 'POST',
                    contentType:'json',
                    contentType:'application/json',
                    data: JSON.stringify(data),
                    success: function(msg){ 
                        $('#myModal').modal('hide');
                        window.location.replace('/composer');
                    }
                });
            }

            else{
                const cid= $(this).attr('id');
                $.ajax({
                    url:'/composer/update?id='+cid,
                    type: 'PUT',
                    contentType:'json',
                    contentType:'application/json',
                    data: JSON.stringify(data),
                    success: function(msg){ 
                        $('#myModal').modal('hide');
                        edit=false;
                        window.location.replace('/composer');
                    }
                });
            }
        }   
    });

    document.getElementById('bpm').addEventListener('input', e => {
    Tone.Transport.bpm.value = Math.round(e.target.value);
    $('#bpm-text').text(e.target.value);    
    });

    const synths = [
        new Tone.MembraneSynth().toMaster(),
        new Tone.MembraneSynth().toMaster(),
        new Tone.MembraneSynth().toMaster(),
        new Tone.MembraneSynth().toMaster(),
        new Tone.MembraneSynth().toMaster()
    ];

    const gain = new Tone.Gain(0.5);
    gain.toMaster();

    synths.forEach(synth => synth.connect(gain));
    synths.forEach(synth => synth.connect(dest));

    notes = ['C1', 'C2', 'C3', 'C4', 'C5'];

    Tone.Transport.scheduleRepeat(repeat, "16n");
    Tone.Transport.bpm.value = 120;

    function repeat(time) {
        let step = index % 16;
        sequencer.next();
        if(rec==true){
            if(counter==0)
                recorder.start();
    
            else if(counter>15){
                rec=false;
                counter=0;
                recorder.stop();
                Tone.Transport.stop();
            }
        }
        counter++;
        for(let i=0;i<sequencer.rows;i++){
            if(sequencer.matrix.pattern[i][step]==1){
                flag = true;
                synths[i].triggerAttackRelease(notes[i], '16n');
            } 
        }
        if(flag==false && index==0){
            flag=true;
            synths[0].triggerAttack("C100"); 
            synths[0].triggerRelease('16n');     
        }
        index++;
    }

    /*Record */
    $("body").on('click','#download-button',function(){
        if(pause==true){
            $("#play-pause-button").empty();
            $("#play-pause-button").append("<i class='fas fa-play'><i>");
            pause=true;
            Tone.Transport.stop();
        }

        if(rec==false){
            Tone.Transport.stop();
            Tone.Transport.start();
            $("#download-button").empty();
            $("#download-button").append("Link...");
            for(let j=0;j<16;j++){
                if(index%16==0)
                    break;
                sequencer.next();
                index++;
            }
            rec=true;
            flag=false;
            counter=0;
            index=0;
            Tone.Transport.stop();
            Tone.Transport.start();
        }
    });


    recorder.ondataavailable = evt => chunks.push(evt.data);
    recorder.onstop = evt => {
        blob = new Blob(chunks, { type: 'audio/mpeg' });
        link = URL.createObjectURL(blob);

        var reader = new FileReader();
        reader.readAsDataURL(blob); 
        reader.onloadend = function() {
            base64data = reader.result;                
        }

        $('#download-button').after("<a id='download-beat' href="+ URL.createObjectURL(blob)+" download='musify'><i class='fa fa-download'></i></a>");
        $("#download-button").remove();
    };

    $('body').on('click','#download-beat',function () {
        $("#download-beat").remove(); 
        $("#stop-button").after("<button id='download-button'><i class='fa fa-download'></i></button>");
    });

    $('body').on('click','.li-item',function(event){
        $('.delete-button').remove();
        $('.save-button').removeAttr('id');
        $('#'+liCss).css({'color':'white','background-color':''});
        liCss = $(event.target).attr('id');
        $('.modal-title').text('Update Creation');        
        $(event.target).css({'color':'#40e0d0','background-color':'white'});
        const cid = $(event.target).attr('id');   
        $(".save-button").attr('id',cid);
        $(".button-area").append("<button type='button' class='btn btn-danger blue-gradient mt-5 delete-button'>Delete</button>")
        $(".delete-button").attr('id',cid);
        clearMat();
        $.ajax({
            url:'/composer/search?id='+cid,
            type:'GET',
            dataType:'json',
            success: function(data){
                Tone.Transport.bpm.value = data[0].bpm;
                $('#bpm-text').text(data[0].bpm);
                $('.onoffswitch-checkbox').prop('checked', data[0].privacy);
                edit = true;
                if(pause==true){
                    $("#play-pause-button").empty();
                    $("#play-pause-button").append("<i class='fas fa-play'><i>")
                    pause=false;
                    Tone.Transport.stop();
                }
                Tone.Transport.stop();
                Tone.Transport.start();
                for(let j=0;j<16;j++){
                    if(index%16==0)
                        break;
                    sequencer.next();
                    index++;
                }
                flag=false;
                index=0;
                Tone.Transport.stop();
                $('#download-beat').remove();
                $("#download-button").remove();
                $("#stop-button").after("<button id='download-button'><i class='fas fa-download'></i></button>");        
                $("#add-button").text('Update');    
                $("#title").val(data[0].title);
                for(let i=0;i<5;i++){
                    for(let j=0;j<data[0].beats[0].length;j++){
                        if(data[0].beats[i][j]==1)
                            sequencer.matrix.toggle.cell(j,i);                                           
                    }
                }            
            }
        });
    });

    /*Delete */
    $('body').on('click','.delete-button',function(event){
        const cid = $(this).attr('id');

        if(confirm("Do you want to permanently remove the creation?")){
            $.ajax({
                url:'/composer/delete?id='+cid,
                type:'delete',
                success: function(data){
                    edit = false;
                    window.location.replace('/composer');
                }
            });
        }

    });
    
    function clearMat(){
        for(let i=0;i<sequencer.rows;i++)
        {
            for(let j=0;j<sequencer.columns;j++){
                if(sequencer.matrix.pattern[i][j] == true)
                    sequencer.matrix.toggle.cell(j,i);
            }
        }
    }

    $('#add-button').on('click',function(){
        if(pause==true){
            $("#play-pause-button").empty();
            $("#play-pause-button").append("<i class='fas fa-play'><i>");
            pause=false;
            Tone.Transport.stop();
        }
    
        if(rec==false){
            Tone.Transport.stop();
            Tone.Transport.start();
            $("#download-button").empty();
            $("#download-button").append("Link...");
            for(let j=0;j<16;j++){
                if(index%16==0)
                    break;
                sequencer.next();
                index++;
            }
            rec=true;
            flag=false;
            counter=0;
            index=0;
            Tone.Transport.stop();
            Tone.Transport.start();
        }
        $('#addModal').modal('show');    
    });        
}
