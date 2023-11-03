//In the case of directions 1:top 2:right 3:bottom 4:left

let gameObj = {
    start:false,
    end:false,
    dimentions:[3,3],
    key_locations:{
        start_cell:false,
        end_cell:false
    },

    //pipe_lib is set up as input:output.
    pipe_lib:{
        horizontal:{4:2,2:4},
        vertical:{1:3,3:1},
        top_right:{1:2,2:1},
        top_left:{4:1,1:4},
        bottom_left:{4:3,3:4},
        bottom_right:{3:2,2:3}
    }
}

const player = {
    dragging:false
}
init();
async function init(){
    // Decide start and end of puzzle
    gameObj.start = await placeMarker();
    gameObj.end = await placeMarker();

    $(".startMarker").css("transform",`translateY(${10 * gameObj.start}vh)`);
    $(".endMarker").css("transform",`translateY(${10 * gameObj.end}vh)`);

    gameObj.key_locations.start_cell = [0, gameObj.start]
    gameObj.key_locations.end_cell = [gameObj.dimentions[1] - 1, gameObj.end]

    playerControls();
}

async function placeMarker(){
    const rng = Math.floor(Math.random()*gameObj.dimentions[1]);
    return rng;
}

function playerControls(){
    $(".pieces .piece").on("dragstart",(event)=>{
        player.dragging = $(event.currentTarget).clone();
    })

    $('.cell').on("dragover",(event)=>{
        //Disable default behavour for dragover. I think it normally stops dropability
        event.preventDefault();
    }).on("drop",(event)=>{
        $(event.currentTarget).append(player.dragging);
        player.dragging = false;
    })
}