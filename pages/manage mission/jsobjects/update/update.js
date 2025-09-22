export default {
	updateMissionTask: async ({name, description, effortEstimate}, index) => {
		storeValue("isLoading", true);

		const mission = MissionTable.selectedRow

		const newDefaultTaskList = index > -1 ? [
			...mission.defaultTaskList.slice(0, index),
			{name, description, effortEstimate},
			...mission.defaultTaskList.slice(index+1),
		] :[
			...mission.defaultTaskList,
			{name, description:description ?? '', effortEstimate: effortEstimate ?? 0}
		]

		if(mission?.id) {
			await Update_Mission.run({
				missionId: mission.id,
				set: {
					defaultTaskList: newDefaultTaskList,
				}
			})

			await get.getMissionList()
		}

		storeValue("isLoading", false);
	},

	deleteMissionTask: async (index) => {
		storeValue("isLoading", true);

		const mission = MissionTable.selectedRow;

		if(mission?.id && index > -1) {
			await Update_Mission.run({
				missionId: mission.id,
				set: {
					defaultTaskList: [
						...mission.defaultTaskList.slice(0, index),
						...mission.defaultTaskList.slice(index+1),
					],
				}
			})

			await get.getMissionList()
		}

		storeValue("isLoading", false);
	},

	submitMission: async ({name, ...set}) => {
		try {
			storeValue("isLoading", true);

			const missionId = MissionTable.selectedRow?.id;

			console.log(set);

			// 수정
			if(missionId && name) {
				await Update_Mission.run({missionId, set: {
					name,
					...set
				}})
			} 
			// 생성
			else {
				const newId = util.makeRandomIdWithPrefix('mi', 10);

				if(name) {
					await Insert_Mission.run({
						mission: {
							id: newId,
							name,
							...set,
							dailyMissionDate: moment(set.dailyMissionDate).toDate(),
							precedingMissionIdList: [],
							isDraft: false,
						}
					});

					if(set.isDailyMission) {
						// 미션 삽입 성공시, 알림 전송
						await Post_DailyMission_Notification.run({
							missionId: newId
						});
					}
				}
			}
		} catch(e) {} 
		finally {
			storeValue("isLoading", false);
			await get.getMissionList();
		}
	},

	submitPostTag: async ({title}) => {
		if(!title?.trim()) {
			return;
		}

		const tag = await Get_PostTag_By_Title.run({title});

		console.log(tag);
		if(tag?.[0]?.id) {
			return;
		}

		const newTagId = util.makeRandomId(18);
		console.log('new', {
			id: newTagId,
			title
		})

		const ret = await Insert_Tag.run({
			id: newTagId,
			title
		});
		await Get_TagList.run();

		return ret;
	},

	deleteMission: async () => {
		storeValue("isLoading", true);

		const missionId = MissionTable.selectedRow?.id;

		if(missionId) {
			await Delete_Mission.run({
				missionId
			})

			await get.getMissionList();
		}

		storeValue("isLoading", false);
	},

	// updateMissionProgress: async ({missionId, levelRequirement} = {missionId:'mi_NPPCAoSqiC', levelRequirement: 10}) => {
	// if(!missionId || !levelRequirement) {
	// return;
	// }
	// 
	// const missionProgressList = await Get_ProgressList_BeforeDoing.run({missionId});
	// 
	// const userIdList = missionProgressList.map((progress)=>progress.userId);
	// const playerList = await Get_PlayerList.run({userIdList});
	// const userIdToLevelMap = playerList.reduce((acc, player)=>({
	// ...acc,
	// [player.userId]: player.level,
	// }), {});
	// 
	// const missionProgressForUpdateList = missionProgressList.map((missionProgress)=> {
	// const userLevel = userIdToLevelMap[missionProgress.userId];
	// 
	// let newStatus = null;
	// if(userLevel >= levelRequirement) {
	// newStatus = 'available';
	// } else {
	// newStatus = 'unavailable'
	// }
	// 
	// if(!newStatus || missionProgress.status === newStatus) {
	// return null;
	// };
	// 
	// return {
	// userId: missionProgress.userId,
	// missionId: missionProgress.missionId,
	// status: newStatus,
	// userLevel,
	// levelRequirement,
	// oldStatus: missionProgress.status,
	// }
	// }).filter((missionProgress)=>!!missionProgress)
	// 
	// const count = Math.floor(missionProgressForUpdateList.length / util.INSERT_BATCH_SIZE) + (missionProgressForUpdateList.length % util.INSERT_BATCH_SIZE === 0 ? 0 : 1);
	// await Promise.all(
	// Array.from({length: count}).map(
	// async (_, index) => {
	// await Promise.all(missionProgressForUpdateList.slice(index * util.INSERT_BATCH_SIZE, (index+1) * util.INSERT_BATCH_SIZE).map(async ({missionId, userId, status})=> {
	// await Update_MissionProgressStatus.run({missionId, userId, status});
	// }))
	// }
	// )
	// )
	// 
	// return missionProgressForUpdateList;
	// }
}