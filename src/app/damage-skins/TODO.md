- [x] Add damage numbers
- [x] Local storage save
- [x] Damage number animations
- [ ] Damage animations
- [ ] Mob hit animations
- [ ] Custom mobs?
- [ ] Actual data ingestion
- [ ] Support for unit damge skins
- [ ] Crit effect



We need to create some kind of animation on click, idk how to do that. 
Maybe create temporary divs somehow 
But we also need some kind of array that we append to because if the person clicks multiple times its important

- Effect.wz/DamgeSkin.img/{number}/
	- NoCri0, NoCri1, NoRed0, NoRed1
		- Cri0 = Crit non-first num
		- Cri1 = Crit first num (contains crit splash)
		- Red0 = Non-crit, incl guard/miss/etc
		- Red1 = Non-crit first num (no splash)
	- Unit damage skins have NoCustom (B/M/K)
