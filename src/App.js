import React from 'react';
import ReactDOM from 'react-dom';
import {Button, Card, Select, MenuItem} from '@material-ui/core';
import $ from 'jquery';
import * as Tone from 'tone';
import FrequencyMap from 'note-frequency-map';

var osc; 
var synth;
var loop;

const Buttons = {
    1: {
        note: 'C4',
        frequency: FrequencyMap.noteFromName('c4').frequency,
        type: 'sustained',
        timing: '8n',
        hold: '8n',
    },
    2: {
        note: 'D4',
        frequency: FrequencyMap.noteFromName('c4').frequency,
        type: 'attackRelease',
        timing: '4n',
        hold: '8n',
    },
    3: {
        note: 'C4',
        frequency: FrequencyMap.noteFromName('c4').frequency,
        type: 'sustained',
        timing: '2n',
        hold: '8n',
    },
}
function App() {
    const [sound1Progress, setSound1Progress] = React.useState(0);  // between 0 and 100
    const [soundPlaying, setSoundPlaying] = React.useState(0);
    const [buttons, setButtons] = React.useState(Buttons);

    function toggleSound(num) {
        if(soundPlaying != num) {
            $(`#sound${soundPlaying}`).text(`Play Sound ${soundPlaying}`);
            $(`#sound${num}`).text(`Stop Sound ${num}`);
            setSoundPlaying(num);

            let button = buttons[num];
            if(button.type == 'sustained') {
                console.log("Playing Sustained Note " + button.note);
                if(typeof osc === 'undefined') {
                    osc = new Tone.Oscillator(button.frequency, "sine").toDestination().start();
                } else {
                    osc.set({frequency: button.frequency,});
                    osc.start();
                }
            } else if (button.type == 'attackRelease') {
                if(typeof loop === 'undefined') {
                    console.log('A: ' + button.note);
                    Tone.Transport.stop();

                    synth = new Tone.Synth().toDestination();
                    loop = new Tone.Loop((time) => {
                        synth.triggerAttackRelease(button.note, button.hold);
                    }, button.timing).start(0);

                    Tone.Transport.start();
                } else {
                    Tone.Transport.stop();

                    console.log('B: ' + button.note);
                    loop = new Tone.Loop((time) => {
                        synth.triggerAttackRelease(button.note, button.hold);
                    }, button.timing).start(0);

                    Tone.Transport.start();
                }
            }
            
        } else {
            delete loop;
            Tone.Transport.cancel();
            Tone.Transport.stop();
            if(typeof osc !== 'undefined') osc.stop();

            $(`#sound${num}`).text(`Play Sound ${num}`);
            setSoundPlaying(0);
        }
    };

    function changeNote(num) {
        let name = $(`#sound${num}ToneSelect`).val();
        let freq = FrequencyMap.noteFromName(name).frequency;
        let timing = $(`#${num}TimingSelector`).val();
        let type = $(`#${num}TypeSelector`).val();
        let hold = $(`#${num}HoldSelector`).val();

        console.log(num, name, freq, timing);
        setButtons({...buttons, [num]: {...buttons[num],  frequency: freq, note: name, timing: timing, type: type, hold: hold}})
    }

    function addAnother(num) {
        let newButton = {
            note: 'C4',
            frequency: FrequencyMap.noteFromName('c4').frequency,
            type: 'sustained',
            timing: '8n',
            hold: '8n',
        }
        let length = Object.keys(buttons).length;
        setButtons({...buttons, [length + 1]: newButton})
        console.log(buttons);
    };

    const pianoNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const timings = ['1n', '2n', '3n', '4n', '8n', '10n', '12n'];
    let allNotes = [];
    for(let i = 1; i < 6; i++) {
        pianoNotes.forEach((note) => {
            allNotes.push(note + i);
        })                   
    }
    return (
        <>  
            {Object.keys(buttons).map((button, index) => {
                index = index + 1;
                button = buttons[index];
                return (
                    <Card className="card" key={index}> 
                        <Button variant="contained" color="primary" onClick={() => toggleSound(index)} id={`sound${index}`}> Play Sound {index} </Button> 
                        <select onChange={() => changeNote(index)} id={`sound${index}ToneSelect`} value={button.note}>
                            {allNotes.map((note) => {
                            return <option value={note}>{note}</option>
                            })}
                        </select>

                        <select value={button.timing} onChange={() => changeNote(index)} id={`${index}TimingSelector`}> 
                            {timings.map((timing) => {
                                return <option value={timing}> {timing} </option>
                            })}
                        </select>

                        <select value={button.hold} onChange={() => changeNote(index)} id={`${index}HoldSelector`}> 
                            {timings.map((timing) => {
                                return <option value={timing}> {timing} </option>
                            })}
                        </select>

                        <select value={button.type} onChange={() => changeNote(index)} id={`${index}TypeSelector`}> 
                            <option value='sustained'> sustained </option>
                            <option value='attackRelease'> attack release </option>
                            <option value='chirp'> chirp </option>
                        </select>

                    </Card>
                )
            })
            }
            <Button variant="contained" color="secondary" onClick={addAnother}> Add Another </Button>
        </>
    )
}

ReactDOM.render(<App/>, document.getElementById('root'));