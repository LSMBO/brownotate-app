export default class Run {
    constructor(id, parameters) {
        this.id = id;
        this.parameters = parameters;
        this.data = '';
        this.status = 'running';
    }

    updateStatus(status) {
        this.status = status;
    }

    updateData(data) {
        this.data = data;
    }
}
