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
    },
    zoom_level:0
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
    gameObj.key_locations.end_cell = [gameObj.dimentions[1] - 1, gameObj.end];

    // Set up board matrix
    gameObj.board_matrix = [];
    for(let i = 0; i < gameObj.dimentions[1]; i++){
        const row = [];
        for(let g = 0; g < gameObj.dimentions[0]; g++){
            row.push("empty")
        }
        gameObj.board_matrix.push(row)
    }

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
        
        const y = $(event.currentTarget).parent().attr("id").replaceAll("row","");
        const x = $(event.currentTarget).attr("id").replaceAll("col","");
        const type = player.dragging.children('.pipe').attr("type");

        gameObj.board_matrix[y][x] = type

        console.log(gameObj.board_matrix);

        player.dragging = false;
    })


    // *Tabled for now. Divs were not set up for this*
    // Zoom Controls
    // $(".game").on("wheel",(event)=>{
    //     switch(event.originalEvent.deltaY){
    //         case 100:
    //             console.log("out")
    //             if(gameObj.zoom_level > 0){
    //                 gameObj.zoom_level -= 10;
    //             }
    //         break;

    //         case -100:
    //             console.log("in")
    //             if(gameObj.zoom_level < 90){
    //                 gameObj.zoom_level += 10;
    //             }
    //         break;
    //     }

    //     console.log(`1.${gameObj.zoom_level}`)
    //     $(".board").css("scale",`1.${gameObj.zoom_level}`);
    // })


    //Start
    $("#start").on("click",(event)=>{
        startSim();
    })
}

async function startSim(){

    let end = false;
    let currentPipe = gameObj.key_locations.start_cell;
    let lastDirection = 4;
    do{
        // console.log("CURRENTPIPE", currentPipe)
        let check = await checkPipe(currentPipe, lastDirection);
        // console.log(check);

        if(check == 'END'){
            // If the end cell is correct. Game Win
            console.log("WOW")
            end = true;
        }else if(!check){
            end = true;
        }else{
            switch(check[1]){
                case 1:
                    // Next pipe is up
                    currentPipe = [currentPipe[0], currentPipe[1] - 1];
                    lastDirection = 3;
                break;

                case 2:
                    // Next pipe is right
                    currentPipe = [currentPipe[0] + 1, currentPipe[1]]
                    lastDirection = 4;
                break;

                case 3:
                    // Next pipe is down
                    currentPipe = [currentPipe[0], currentPipe[1] + 1]
                    lastDirection = 1;
                break;

                case 4:
                    // Next pipe is left
                    currentPipe = [currentPipe[0] - 1, currentPipe[1]]
                    lastDirection = 2;
                break;
            }
        }

    }
    while(!end)
}

async function checkPipe(pipe, lastDirection){
    // Variable naming is a little confusing here
    // input is the input for the next pipe
    // lastDirection is the input for this pipe

    let pipeType = gameObj.board_matrix[pipe[1]][pipe[0]];

    if(pipeType == "empty"){
        console.log(pipe[0],pipe[1], "Empty")
        return false;
    }

    let pipeDir = gameObj.pipe_lib[pipeType];

    let input = pipeDir[lastDirection];
    if(!input){
        console.warn(pipe[0], pipe[1], "No connection")
        return false;
    }



    // console.log("Pipe is coming from",lastDirection);
    // console.log("Pipe is going to", pipeDir[lastDirection]);
    console.log(pipe[0], pipe[1], "Correct")





    // Water animation triggers;
    const water = $(`#row${pipe[1]} #col${pipe[0]} .water`);
    const waterStatus = await waterAnim(water, lastDirection, input);

    // Check if victory
    let end_cell = gameObj.key_locations.end_cell.toString();
    let cell = [pipe[0], pipe[1]].toString();

    console.warn(input)
    if((end_cell == cell) && (input == 2)){
        return 'END'
    }

    return [true, input];
}

async function waterAnim(water, inputDir, outputDir){
    console.log("The water is coming from", inputDir, "and exiting from", outputDir)
    return new Promise((resolve, reject)=>{

        // Didn't want to set up a big switch but i guess this works

            switch(`${inputDir}` + `${outputDir}`){
                // Vertical
                case '13':
                    $(water[0]).css({'transform-origin':'top','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        resolve("PIPE DONE")
                    })
                break;
                case '31':
                    $(water[0]).css({'transform-origin':'bottom','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        resolve("PIPE DONE")
                    })
                break;

                // Horizontal
                case '42':
                    $(water[0]).css({'transform-origin':'left','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        resolve("PIPE DONE")
                    })
                break;
                case '24':
                    $(water[0]).css({'transform-origin':'right','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        resolve("PIPE DONE")
                    })
                break;

                // Top Left
                case '41':
                    $(water[1]).css({'transform-origin':'left','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        $(water[0]).css({'transform-origin':'bottom','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                            $(event.currentTarget).off("transitionend");
                            resolve("PIPE DONE")
                        })
                    })
                break;
                case '14':
                    $(water[0]).css({'transform-origin':'top','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        $(water[1]).css({'transform-origin':'right','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                            $(event.currentTarget).off("transitionend");
                            resolve("PIPE DONE")
                        })
                    })
                break;

                // Top Right
                case '12':
                    $(water[0]).css({'transform-origin':'top','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        $(water[1]).css({'transform-origin':'left','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                            $(event.currentTarget).off("transitionend");
                            resolve("PIPE DONE")
                        })
                    })
                break;
                case '21':
                    $(water[1]).css({'transform-origin':'right','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        $(water[0]).css({'transform-origin':'bottom','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                            $(event.currentTarget).off("transitionend");
                            resolve("PIPE DONE")
                        })
                    })
                break;

                // Bottom Left
                case '34':
                    $(water[0]).css({'transform-origin':'bottom','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        $(water[1]).css({'transform-origin':'right','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                            $(event.currentTarget).off("transitionend");
                            resolve("PIPE DONE")
                        })
                    })
                break;
                case '43':
                    $(water[1]).css({'transform-origin':'left','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        $(water[0]).css({'transform-origin':'top','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                            $(event.currentTarget).off("transitionend");
                            resolve("PIPE DONE")
                        })
                    })
                break;

                // Bottom Right
                case '32':
                    $(water[0]).css({'transform-origin':'bottom','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        $(water[1]).css({'transform-origin':'left','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                            $(event.currentTarget).off("transitionend");
                            resolve("PIPE DONE")
                        })
                    })
                break;
                case '23':
                    $(water[1]).css({'transform-origin':'right','transform':'scaleX(1)'}).on("transitionend",(event)=>{
                        $(event.currentTarget).off("transitionend");
                        $(water[0]).css({'transform-origin':'top','transform':'scaleY(1)'}).on("transitionend",(event)=>{
                            $(event.currentTarget).off("transitionend");
                            resolve("PIPE DONE")
                        })
                    })
                break;

                default:
                    reject('Bad Directions');
            }
    })
}
