
const getModelVersion = async (param, PlatformApi, ctx) => {
    console.log(JSON.stringify({ "message": "Fetching Model Version" }));
    let bim_model = await PlatformApi
        .IafScriptEngine.getCompositeCollection(
            {
                "_userType": "bim_model_version",
                "_versions._userAttributes.bimpk.fileId": param._fileId
            }, ctx, { getLatestVersion: true });
    PlatformApi.IafScriptEngine.setVar("bim_model", bim_model);

}


const mapElementsType = async (param, PlatformApi, ctx) => {
    const modelRelatedCollection = await PlatformApi
        .IafScriptEngine.getCollectionsInComposite(
            PlatformApi.IafScriptEngine.getVar("bim_model")._id, null, ctx);
    const model_type_el_coll = modelRelatedCollection.find(x => x._userType === 'rvt_type_elements');
    const model_els_coll = modelRelatedCollection.find(x => x._userType === 'rvt_elements');
    let typeElements = await PlatformApi.IafScriptEngine
        .getItems({
            _userItemId: model_type_el_coll._userItemId,
            options: {
                page: {
                    getAllItems: true
                }
            }
        }, ctx);
    let assetTypeMap = await PlatformApi.IafScriptEngine
        .getItems({
            "collectionDesc": {
                "_userType": "iaf_dt_type_map_defs_coll",
                "_namespaces": ctx._namespaces
            },
            options: {
                page: {
                    getAllItems: true
                }
            }
        }, ctx);
    let elements = await PlatformApi.IafScriptEngine
        .getItems({
            _userItemId: model_els_coll._userItemId,
            options: {
                page: {
                    getAllItems: true
                }
            }
        }, ctx);
    console.log(JSON.stringify({ "message": "Re-mapping Type Elements" }));
    for (let typeElement of typeElements) {
        if (typeElement.properties.hasOwnProperty("Revit Family") && typeElement.properties.hasOwnProperty("Revit Type")) {
            let _myRow = assetTypeMap.find(x => x["Revit Family"] == typeElement.properties["Revit Family"].val && x["Revit Type"] == typeElement.properties["Revit Type"].val);
            if (_myRow) {
                if (_myRow.hasOwnProperty("dtCategory")) {
                    typeElement.dtCategory = _myRow.dtCategory;
                }
                if (_myRow.hasOwnProperty("dtType")) {
                    typeElement.dtType = _myRow.dtType;
                }

            }
        }


    }
    console.log(JSON.stringify({ "message": "Re-mapping Model Elements" }));
    for (let element of elements) {
        let _myVal = typeElements.find(x => x.id == element.type_id);
        if (_myVal) {
            if (_myVal.hasOwnProperty("dtCategory")) {
                element.dtCategory = _myVal.dtCategory;
            }
            if (_myVal.hasOwnProperty("dtType")) {
                element.dtType = _myVal.dtType;
            }
            if (_myVal.hasOwnProperty("baType")) {
                element.baType = _myVal.baType;
            }
        }
    }
    await PlatformApi.IafScriptEngine.updateItemsBulk({
        _userItemId: model_els_coll._userItemId,
        items: elements

    }, ctx);
    await PlatformApi.IafScriptEngine.updateItemsBulk({
        _userItemId: model_type_el_coll._userItemId,
        items: typeElements
    }, ctx);
}


export default {
    async mapAssetCollection(params, PlatformApi, ctx) {

        await getModelVersion(params, PlatformApi, ctx);
        await mapElementsType(params, PlatformApi, ctx);
        let assetCollection = await PlatformApi.IafScriptEngine
            .getCollection({
                _userType: "iaf_ext_asset_coll",
                _shortName: "asset_coll",
                _itemClass: "NamedUserCollection"
            }, ctx);

        let assets = await PlatformApi.IafScriptEngine
            .getItems({
                _userItemId: assetCollection._userItemId,
                options: {
                    page: {
                        getAllItems: true
                    }
                }
            }, ctx);
        let assetTypeMap = await PlatformApi.IafScriptEngine
            .getItems({
                "collectionDesc": {
                    "_userType": "iaf_dt_type_map_defs_coll",
                    "_namespaces": ctx._namespaces
                },
                options: {
                    page: {
                        getAllItems: true
                    }
                }
            }, ctx);
        console.log(JSON.stringify({ "message": "Re-mapping Assets" }));
        for (let asset of assets) {
            if (asset.properties.hasOwnProperty("Revit Family") && asset.properties.hasOwnProperty("Revit Type")) {
                let _myRow = assetTypeMap.find(x => x["Revit Family"] == asset.properties["Revit Family"].val && x["Revit Type"] == asset.properties["Revit Type"].val);
                if (_myRow) {
                    asset.properties.dtCategory.val = _myRow.dtCategory;
                    asset.properties.dtType.val = _myRow.dtType;
                }
            }

        }

        await PlatformApi.IafScriptEngine.updateItemsBulk({
            _userItemId: assetCollection._userItemId,
            items: assets
        }, ctx);

        return true;

    }

}