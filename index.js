

//const ctx = document.querySelector('.canvas').getContext('2d');

/* 
Line
ctx.beginPath();
ctx.moveTo(50 * 2, 420 * 2);
ctx.lineTo((window.innerWidth - 50) *2, 330 * 2);
ctx.lineWidth = 2;
ctx.strokeStyle = 'white'; // If active, the line will be white.
ctx.stroke(); 
*/

/* 
Circle
ctx.beginPath();
ctx.arc(100, 100, 20, 0, 2 * Math.PI, false);
ctx.fillStyle = 'red';
ctx.fill(); 
*/

class Session {
    constructor() {
        this.canvas = document.querySelector('.canvas');
        this.ctx = this.canvas.getContext('2d');

        this.nextKey = 4;

        this.activeConnector = null;

        this.inputs = [];
        this.outputs = [];

        this.gates = [];  // Need some sort of hierarchy or just go through each on until no changes.

        this.states = {};

        this.connections = {

        };
    };

    createGate(x, y, type) {
        const newGate = document.createElement('div');

        const inputArray = [];
        const outputArray = [];

        newGate.style.position = 'absolute';
        newGate.classList.add('gate');
        newGate.classList.add(type);
        newGate.style.left = x + 'px';
        newGate.style.top = y + 'px';
        newGate.style.transform = 'translate(-50%, -50%)';

        const label = document.createElement('p');
        label.classList.add('gate-name')
        label.textContent = type.toUpperCase()

        const inputs = document.createElement('div');
        inputs.classList.add('gate-inputs');

        const input1 = document.createElement('div');
        
        switch (type) {
            case 'and':
            case 'or':
                const input2 = document.createElement('div');
                input2.classList.add('gate-input');
                input2.classList.add('connector');
                input2.setAttribute('key', this.nextKey);
                inputArray.push(this.nextKey);
                this.nextKey++;
                inputs.appendChild(input2);
            case 'not':
                input1.classList.add('gate-input');
                input1.classList.add('connector');
                input1.setAttribute('key', this.nextKey);
                inputArray.push(this.nextKey);
                this.nextKey++;
                inputs.appendChild(input1);
                break;
            default:
                console.error('Invalid Gate');
                break;

        }

        const outputs = document.createElement('div');
        outputs.classList.add('gate-outputs');

        const output = document.createElement('div');
        output.classList.add('gate-output');
        output.classList.add('connector');
        output.setAttribute('key', this.nextKey);
        outputArray.push(this.nextKey);
        this.nextKey++;

        outputs.appendChild(output);

        newGate.appendChild(label)
        newGate.appendChild(inputs)
        newGate.appendChild(outputs)

        document.querySelector('.gates').appendChild(newGate);

        this.gates.push({
            inputs: [...inputArray],
            outputs: [...outputArray],
            type,
        });

        this.addGate(newGate)
    };

    addGate(element) {
        Object.values(element.children[1].children).forEach((connector) => {
            const key = connector.getAttribute('key');
            connector.onclick = () => {
                if (this.activeConnector !== null) {
                    if (this.connections[this.activeConnector].includes(key)) {
                        this.connections[this.activeConnector].splice(this.connections[this.activeConnector].indexOf(key), 1)
                    } else {
                        this.connections[this.activeConnector].push(key);
                    };
                    this.updateStates();
                };
            };
        })

        Object.values(element.children[2].children).forEach((connector) => {
            const key = connector.getAttribute('key');

            this.states[key] = false;
            this.connections[key] = [];

            connector.onclick = () => {
                this.activeConnector = key;
            };
        });
    };

    getElementConnectorPos(key) {
        const position = document.querySelector(`.connector[key = '${key}']`).getBoundingClientRect()
        return {
            x: position.x + (position.width / 2),
            y: position.y + (position.height / 2)
        };
    };

    createInput() {
        const element = document.createElement('div');
        element.setAttribute('key', this.nextKey);
        element.classList.add('input');

        const connector = document.createElement('div');
        connector.setAttribute('key', this.nextKey);
        connector.classList.add('input-connector');
        connector.classList.add('connector');

        document.querySelector('.inputs').appendChild(element);
        document.querySelector('.input-connectors').appendChild(connector);

        this.nextKey++;

        this.addInput(element);
    };

    addInput(element) {
        element.onclick = () => {
            element.classList.toggle('active');
            this.updateStates();
        };

        const key = element.getAttribute('key');

        document.querySelector(`.connector[key = '${key}']`).onclick = () => {
            this.activeConnector = key;
        };

        this.states[key] = false;
        this.connections[key] = [];

        this.inputs.push(element);
        this.updateStates();
    };

    createOutput() {
        const element = document.createElement('div');
        element.setAttribute('key', this.nextKey);
        element.classList.add('output');

        const connector = document.createElement('div');
        connector.setAttribute('key', this.nextKey);
        connector.classList.add('output-connector');
        connector.classList.add('connector');

        document.querySelector('.outputs').appendChild(element);
        document.querySelector('.output-connectors').appendChild(connector);

        this.nextKey++;

        this.addOutput(element);
    };

    addOutput(element) {
        const key = element.getAttribute('key');

        document.querySelector(`.connector[key = '${key}']`).onclick = () => {
            if (this.activeConnector !== null) {
                if (this.connections[this.activeConnector].includes(key)) {
                    this.connections[this.activeConnector].splice(this.connections[this.activeConnector].indexOf(key), 1)
                } else {
                    this.connections[this.activeConnector].push(key);
                };
                this.updateStates();
            };
        };

        this.outputs.push(element);
        this.updateStates();
    };

    drawConnection(pos1, pos2, color) {
        this.ctx.beginPath();
        this.ctx.moveTo(pos1.x * 2, pos1.y * 2);
        this.ctx.lineTo(pos2.x * 2, pos2.y * 2);
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    };

    evaluateGate(gate) {
        switch (gate.type) {
            case 'and':
                return this.states[gate.inputs[0]] && this.states[gate.inputs[1]];
            case 'or':
                return this.states[gate.inputs[0]] || this.states[gate.inputs[1]];
            case 'not':
                return !this.states[gate.inputs[0]];
            default:
                console.error('Invalid Gate', gate.type);
        };
    };

    updateConnections() {
        Object.keys(this.connections).forEach((connection) => {
            this.connections[connection].forEach((node) => {
                if (this.states[connection]) {
                    this.states[node] = true;
                };
            });
        });
    };

    updateOutputs() {
        this.outputs.forEach((output) => {
            const key = output.getAttribute('key');
            if (this.states[key]) {
                output.classList.add('active');
            } else {
                output.classList.remove('active');
            };
        })
    };;

    updateStates() {
        let changes = true;

        Object.keys(this.states).forEach((state) => this.states[state] = false);

        this.inputs.forEach((input) => {
            if (input.classList.contains('active')) {
                this.states[input.getAttribute('key')] = true;
                    this.connections[input.getAttribute('key')].forEach((connection) => {
                    this.states[connection] = true;
                });
            };
        });

        this.updateConnections();

        changes = true;

        while (changes) {
            changes = false;
            Object.keys(this.gates).forEach((gate) => {
                const newValue = this.evaluateGate(this.gates[gate]);
                this.gates[gate].outputs.forEach((output) => {
                    if (this.states[output] !== newValue) {
                        this.states[output] = newValue;
                        this.updateConnections();
                        changes = true;
                    };
                });
            });
        };

        // Clear Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw Connections
        Object.keys(this.connections).forEach((connection) => {
            const connectionPos = this.getElementConnectorPos(connection);
            this.connections[connection].forEach((result) => {
                this.drawConnection(connectionPos, this.getElementConnectorPos(result), this.states[connection] ? '#ffffff' : '#404246');
            });
        });

        this.updateOutputs();
    };

    hideContextMenus() {
        document.querySelector('.contextmenu-gate').classList.add('hidden');
        document.querySelector('.contextmenu-input').classList.add('hidden');
        document.querySelector('.contextmenu-output').classList.add('hidden');
    };

    init() {
        Object.values(document.querySelector('.inputs').children).forEach((input) => this.addInput(input));
        Object.values(document.querySelector('.outputs').children).forEach((output) => this.addOutput(output));
        Object.values(document.querySelector('.gates').children).forEach((gate) => this.addGate(gate));

        document.querySelector('.inputs').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const menu = document.querySelector('.contextmenu-input');
            menu.classList.remove('hidden');
            menu.style.left = `${e.clientX + 10}px`;
            menu.style.top = `${e.clientY + 10}px`;
            menu.children[0].onclick = () => {
                this.createInput();
                menu.classList.add('hidden');
            };
        });

        document.querySelector('.outputs').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const menu = document.querySelector('.contextmenu-output');
            menu.classList.remove('hidden');
            menu.style.left = `${e.clientX + 10}px`;
            menu.style.top = `${e.clientY + 10}px`;
            menu.children[0].onclick = () => {
                this.createOutput();
                menu.classList.add('hidden');
            };
        });

        document.querySelector('.canvas').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const menu = document.querySelector('.contextmenu-gate');
             menu.classList.remove('hidden');
             menu.style.left = `${e.clientX + 10}px`;
             menu.style.top = `${e.clientY + 10}px`;
             menu.children[0].onclick = () => {
                this.createGate(e.clientX, e.clientY, 'and');
                 menu.classList.add('hidden');
            };
             menu.children[1].onclick = () => {
                this.createGate(e.clientX, e.clientY, 'or');
                 menu.classList.add('hidden');
            };
             menu.children[2].onclick = () => {
                this.createGate(e.clientX, e.clientY, 'not');
                 menu.classList.add('hidden');
            };
        });

        document.querySelector('.canvas').onclick = () => this.hideContextMenus();

        this.canvas.width = window.innerWidth * 2;
        this.canvas.height = window.innerHeight * 2;

        this.updateStates();
    };
};

const session = new Session();
session.init();