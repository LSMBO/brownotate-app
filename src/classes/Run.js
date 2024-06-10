export default class Run {
    constructor(parameters) {
        this.id = parameters.id
        this.parameters = parameters;
        this.status = 'uploading files';
    }

    updateStatus(status) {
        this.status = status;
    }

}
