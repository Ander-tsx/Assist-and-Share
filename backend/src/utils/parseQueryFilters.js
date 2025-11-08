export const parseQueryFilters = (query) => {
    const filters = {};

    for (const key in query) {
        const match = key.match(/^(\w+)\[(\w+)\]$/);
        if (match) {
            const field = match[1];
            const operator = match[2];
            const value = query[key];

            if (!filters[field]) filters[field] = {};

            switch (operator) {
                case "regex":
                    try {
                        filters[field]["$regex"] = new RegExp(value, "i");
                    } catch (err) {
                        console.warn(`Expresión regular inválida para ${field}:`, value);
                    }
                    break;
                case "in":
                    filters[field]["$in"] = value.split(",");
                    break;
                case "gt":
                case "gte":
                case "lt":
                case "lte":{
                    if (!isNaN(Date.parse(value)) && value.includes("-")) {
                        filters[field][`$${operator}`] = new Date(value);
                    }
                    else if (!isNaN(value)) {
                        filters[field][`$${operator}`] = Number(value);
                    } else {
                        console.warn(`Valor no numérico ni fecha para ${field}[${operator}]:`, value);
                    }
                    break;
                }
                default:
                    filters[field][`$${operator}`] = value;
            }
        } else {
            const value = query[key];

            if (!isNaN(Date.parse(value)) && value.includes("-")) {
                filters[key] = new Date(value);
            } else if (!isNaN(value)) {
                filters[key] = Number(value);
            } else {
                filters[key] = value;
            }
        }
    }

    console.log("Filtros parseados:", filters);
    return filters;
};
