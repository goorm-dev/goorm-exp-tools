export default {
	getMissionList: async () => {

		storeValue("isLoading", true);

		const missionList = await Get_MissionList.run();

		const categoryIdSet = new Set();

		const tagIdSet = new Set();

		missionList.forEach(({tagIdList, categoryId}) => {
			categoryIdSet.add(categoryId);
			tagIdList.forEach((tagId)=>{
				tagIdSet.add(tagId);
			})
		})

		const categoryIdListFromSet = Array.from(categoryIdSet);
		const tagIdListFromSet = Array.from(tagIdSet);

		const categoryInfoList = await Get_CategoriesByCategoryIds.run({categoryIds:categoryIdListFromSet});
		const tagInfoList = await Get_TagList_By_TagIdList.run({tagIdList: tagIdListFromSet});

		const categoryMap = {};
		const tagMap = {};

		categoryInfoList.forEach(({id, name})=> {
			categoryMap[id] = name;
		})
		tagInfoList.forEach(({id, title})=> {
			tagMap[id] = title;
		})

		const newMissionList = missionList.map(({tagIdList, categoryId, ...mission})=>{
			const orderedTagIdList = tagIdList;
			const orderedTagTitleList = tagIdList.map((id)=>tagMap[id]);

			if(!categoryMap[categoryId]) {
				console.log(mission.name)
			}

			return {
				...mission,
				categoryName: categoryMap[categoryId] ?? '카테고리 없음',
				categoryId,
				tagIdList: orderedTagIdList,
				tagNameList: orderedTagTitleList,
				goormPieceReward: mission.reward.goormPiece,
				experiencePointReward: mission.reward.experiencePoint,
			}
		});

		storeValue("isLoading", false);

		return newMissionList;
	}
}