class EventEmitter {
  constructor() {
    this.events = {};
  }
  
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  
  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

// Usage
const emitter = new EventEmitter();
emitter.on('dataReceived', (data) => console.log('Received:', data));
emitter.emit('dataReceived', { message: 'Hello World' });