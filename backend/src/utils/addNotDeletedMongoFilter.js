export function addNotDeletedFilter(next) {
    const query = this.getQuery();
    if (Object.prototype.hasOwnProperty.call(query, "deleted")) {
        return next();
    }

    this.where({ deleted: false });
    next();
};