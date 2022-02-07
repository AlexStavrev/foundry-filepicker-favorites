
Hooks.once('init', async function() {
	game.settings.register("foundry-filepicker-favorites", "favorites-location", {
		scope: "world",
		config: false,
		type: Array,
		default: [{label: 'Core Icons', source: 'public', path: 'icons/'}]
	});

	game.settings.registerMenu("foundry-filepicker-favorites", "favorites", {
		name: "Favorites Settings",
		label: "Favorites Settings",
		icon: "fas fa-cog",
		type: FavoritesForm,
		restricted: true
	});

	game.settings.register("foundry-filepicker-favorites", "search-max-results", {
		name: "Maximum number of results in search",
		hint: 'User 0 to always display all results.',
		scope: "world",
		config: true,
		type: Number,
		default: 100
	});
});

// backwards compatibility /////////////////////////////////////////////////////////////////////////////////////////////////////////
Hooks.once('ready', async function() {
	let oldSetting:any = game.settings.get("foundry-filepicker-favorites", "favorites-location")
	if (oldSetting instanceof Array && oldSetting.length == 1 && typeof oldSetting[0] === 'string') {
		oldSetting = oldSetting[0];
	}
	if (typeof oldSetting === 'string' || oldSetting instanceof String) {
		console.log("foundry-filepicker-favorites | Found old settings, trying to translate");
		let favorites:Favorite[] = []
		let split = oldSetting.split('|')
		for(let i = 0;i<split.length;i+=3) {
			favorites.push({label: split[i], source: split[i+1], path: split[i+2]})
		}
		game.settings.set("foundry-filepicker-favorites", "favorites-location", favorites);
	}
});
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export class Favorite {
	label: string
	source: string
	path: string
}

class SourceOption {
}

class FavoritesData {
	sources: FilePicker.Sources
	data: Favorite[]
}

class FavoritesForm extends FormApplication<FormApplicationOptions, FavoritesData, Favorite[]> {
	constructor() {
		super(game.settings.get("foundry-filepicker-favorites", "favorites-location"))
	}
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ['form'],
			popOut: true,
			template: '/modules/foundry-filepicker-favorites/templates/favoritesForm.html',
			id: 'foundry-filepicker-favorites-form',
			title: 'Favorites Settings',
		});
	}

	getData() {
		return {
			sources: new FilePicker({}).sources,
			data: this.object
		};
	}

	activateListeners(html) {
		super.activateListeners(html);
		html.find("#addFavorite").on("click", this._addRow.bind(this));
		html.find(".deleteFavoriteOption").on("click", this._removeRow.bind(this));
	}

	_addRow(e:Event) {
		let flat = foundry.utils.expandObject(this._getSubmitData());
		let result:Favorite[] = Object.values(flat);
		result.push(new Favorite());
		this.object = result
		this.render(false, {height: "auto"} as any);
	}

	_removeRow(e:Event) {
		let flat = foundry.utils.expandObject(this._getSubmitData());
		let result:Favorite[] = Object.values(flat);
		let index = (e.currentTarget as HTMLButtonElement).dataset.index;
		if(index) {
			result.splice(parseInt(index), 1);
			this.object = result;
			this.render(false, {height: "auto"} as any);
		}
	}

	async _updateObject(event, formData) {
		let flat = foundry.utils.expandObject(formData);
		let result:Favorite[] = Object.values(flat);
		game.settings.set("foundry-filepicker-favorites", "favorites-location", result);
	}
}
