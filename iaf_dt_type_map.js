let dtTypesMap = {
    async loadTypeMap(input, libraries, ctx, callback) {
        console.log("input", input)
        let { PlatformApi } = libraries
        let proj = await PlatformApi.IafProj.getCurrent(ctx)

        console.log(proj, "proj")
        let bimTypeMap = await PlatformApi.IafScriptEngine.getItems({
            query: { dtCategory: { $exists: true } },
            collectionDesc: {
                _userType: "iaf_dt_type_map_defs_coll",
                _namespaces: proj._namespaces
            },
            options: {
                project: {
                    baType: 1,
                    dtCategory: 1,
                    dtType: 1
                },
                page: { getAllItems: true }
            }
        }, ctx)

        console.log(bimTypeMap, "bimTypeMap")

        const dtHierarchy = _.map(
            _.groupBy(bimTypeMap, (dataObj) => {
                return dataObj["dtCategory"];
            }),
            (data) => {

                _.forEach(data, (v) => {
                    types = v["dtType"];
                });
                let res = {
                    _id: 0,
                    dtCategory: _id,
                    dtTypes: types
                };
                return res;
            }
        );
        console.log('categoryCountTotal', categoryCountTotal);

        const assetDataPairs = _.map(dtHierarchy.result, category => {

            let categoryProperties = [category["dtCategory"], category["dtTypes"]]
            return categoryProperties

        });
        console.log('assetDataPairs', assetDataPairs);

    },
}

export default dtTypesMap