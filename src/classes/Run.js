export default class Run {
    constructor(parameters) {
        this.id = parameters.id
        this.parameters = parameters;
        this.status = '';
    }

    updateStatus(status) {
        this.status = status;
    }

}
