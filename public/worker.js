self.slice = [];

onmessage = event => {
    if (event.data.type === 'set_slice')
        self.slice = event.data.slice;
    else if (event.data.type === 'request')
        postMessage(filterData(event.data));
}

const filterData = function(payload) {
    let threshold = 0, max = 0;
    let filteredData = [], indices = [];
    let last = payload.first - payload.currentWidestFeatureLength;

    if (typeof self.slice[0] != 'undefined') {
        for (let d of self.slice) {
            let n = Number(d.index);

            if (n <= payload.first && n >= last) {
                threshold++;

                if (n > max)
                    max = n;

                if (n === max)
                    filteredData.push(d);
            }

            if (n >= payload.first && n <= payload.last)
                indices.push(d);
        }

        if (threshold === 0)
            filteredData = [self.slice[0]];
    }

    return filteredData.concat(indices);
};