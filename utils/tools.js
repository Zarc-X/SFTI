const modules=[
	{
		id:1,
		question:'你更喜欢以下哪一句台词？?',
		options: [
		{ value: 'A', text: '宇宙，最后的疆域界。这是企业号星舰的航程。她将继续去探索未知的新世界。勇敢地航向前人所未至的领域。(《星际迷航》)' },
		{ value: 'B', text: '一切伟大之作都需要牺牲来铸就。星系中的其他生物或许不能理解，但他们必将服从。(《群星：化身天灾》)' }
		],
		analysis: {
		'A':'探索',
		'B':'斗争'
		} 
	},
	{
		id:2,
		question:'文明的发展会最终为人类更多地带来什么?',
		options: [
		{ value: 'A', text: '发展与进化' },
		{ value: 'B', text: '冲突与灾难' }
		],
		analysis: {
		'A':'乐观',
		'B':'悲观'
		}
	},
	{
		id:3,
		question:'你更希望在科幻作品中看到哪种内容?',
		options: [
		{ value: 'A', text: '对未来技术、未知世界的构想' },
		{ value: 'B', text: '对人类、文明的思考' }
		],
		analysis: {
		'A':'构想',
		'B':'反思'
		}
	},
	{
		id:4,
		question:'下面哪种形式的欣赏媒介更对你胃口?',
		options: [
		{ value: 'A', text: '影视、漫画、小说' },
		{ value: 'B', text: '电子游戏' }
		],
		analysis: {
		'A':'故事',
		'B':'游戏'
		}
	}
];

export default modules