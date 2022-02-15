const dataSet = new Map();

export const nonReactiveDataFunctions = {
    getData(name) {
        if (dataSet.has(name)) {
            return dataSet.get(name);
        }
    },

    setData(name, data) {
        dataSet.set(name, data);
    },

    deleteData(name) {
        dataSet.delete(name);
    },
}

export const nonReactiveDataStore = {
    // fullChromData
    get fullChromData() { return nonReactiveDataFunctions.getData('fullChromData') },
    set fullChromData(data) { return nonReactiveDataFunctions.setData('fullChromData', data) },
}

nonReactiveDataStore.fullChromData = [];
