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
    // fullChromeData
    get fullChromeData() { return nonReactiveDataFunctions.getData('fullChromeData') },
    set fullChromeData(data) { return nonReactiveDataFunctions.setData('fullChromeData', data) },
}

nonReactiveDataStore.fullChromeData = [];
