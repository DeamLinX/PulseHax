document.forms.startup.onchange = (e) => {
  const checked = e.target;
  let ID = e.target.id;
  if (checked.checked) {
    userSettings[ID] = true;
    chrome.storage.local.set({Settings:userSettings}, function() {
      console.log(`${ID} is set to ${userSettings[ID]}`);
    });
  } else {
    userSettings[ID] = false;
    chrome.storage.local.set({Settings:userSettings}, function() {
      console.log(`${ID} is set to ${userSettings[ID]}`);
    });
  }
  return false;
}

document.getElementById("darkmodetoggle").addEventListener("click", function(e) {
  /*
  This code is my code. There is much code out there that is like it but this one is mine. It may not be the best code
  But this is the one that I wrote that actually worked.
  
  - Musings of a pickle
  
  */
  document.querySelectorAll("*").forEach(e => e.classList.toggle("dark-mode"));
  let ID = e.target.id;
  userSettings[ID] = (userSettings[ID] ? false : true);
  chrome.storage.local.set({Settings:userSettings}, function() {
    console.log(`${ID} is set to ${userSettings[ID]}`);
  });
});

function refresh() {
  execute("response = {zt:zt, le:le, M:M, lvlSel:xt[Et.lvl.sel], onlineLvlSel:Bo(xt[Et.lvl.sel], 'id')}", function(response) {
    refreshSkip(response);
    refreshSelected(response);
    refreshExport(response);
    refreshCopy(response);
  })
}refresh();

function refreshSkip(response){
  document.getElementById("skipIntro").checked = response.response.zt.skipIntro;
}
function refreshMute(response){
  document.getElementById("disableMenuMusic").checked = response.response.zt.disableMenuMusic;
}
function refreshExport(response){
  document.getElementById("lvlExport").disabled = (!response.response.lvlSel || typeof response.response.lvlSel == "number" || response.response.M != "menu");
}
function refreshCopy(response){
  if(typeof response.response.lvlSel == "number") {
    execute(`Wo(xt[Et.lvl.sel]) == 2`,(r)=>{
      document.getElementById("lvlCopy").disabled = !r.response || response.response.M != "menu";
    })
  } else {;
    document.getElementById("lvlCopy").disabled = !response.response.lvlSel || response.response.M != "menu"
  }
}
function refreshSelected(response) {
  if(response.response.lvlSel) {
    let title = typeof response.response.lvlSel  == "number" ? response.response.onlineLvlSel.title : response.response.lvlSel.title;
    let id = typeof response.response.lvlSel  == "number" ? response.response.lvlSel : response.response.lvlSel.copy ? response.response.lvlSel.copy : "Not Uploaded";
    id = id.toString();
    document.getElementById("SelectedId").value = title.length + id.length + 3 <= 25 ? `${title} (${id})` : `${title.substr(0,21-id.length)}... (${id})`;
  }
}

document.getElementById("skipIntro").addEventListener("click", function() {
  execute(`zt.skipIntro = ${document.getElementById("skipIntro").checked}`);
});
document.getElementById("disableMenuMusic").addEventListener("click", function() {
  execute(`zt.disableMenuMusic = ${document.getElementById("disableMenuMusic").checked}`);
  console.log(document.getElementById("disableMenuMusic").checked)
});

document.getElementById("lvlCopy").addEventListener("click", function() {
  execute(`
  if(typeof xt[Et.lvl.sel] == "number"){
    Uo(xt[Et.lvl.sel]);
    Pt.saved[Pt.saved.length-1].stars = En(xt[Et.lvl.sel]);
  } else {
    Pt.saved.push(x(xt[Et.lvl.sel]));
    Pt.saved[Pt.saved.length-1].title += "(copy)";
  }
  if(Et.lvl.tab == 0) {
    Pt.search = Pt.saved;
  }`
  )
})
document.getElementById("lvlExport").addEventListener("click", function() {
  let zip = new JSZip();
  execute(`xt[Et.lvl.sel]`, function(response) {
    zip.file(`${response.response.title.replace(/[^a-zA-Z0-9 ]/g, '')}.json`, JSON.stringify(response.response));
    zip.generateAsync({type:"blob",compression: "DEFLATE"}).then(function (blob) {
      const a = document.createElement("a");
      const url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = `${response.response.title}.pls`;
      a.click();
      URL.revokeObjectURL(url);
    });
  })
});
document.getElementById("lvlImport").addEventListener("click", function() {
  document.getElementById("lvlImportAction").click();
})
document.getElementById("lvlImportAction").addEventListener("change",function() {
  for(file of document.getElementById("lvlImportAction").files){
    let zip = new JSZip();
    if(/\.pls$/.exec(file.name)){
      zip.loadAsync(file)
      .then(function(zip) {
        console.log(file)
        console.log("file")
        console.log(Object.keys(zip.files)[0])
        console.log("keys")
        console.log(Object.keys(zip.files))
        zip.files[Object.keys(zip.files)[0]].async('string').then(function (fileData) {
          let vtest = JSON.parse(fileData);
          if((Object.hasOwn(vtest,"beat") && Object.hasOwn(vtest,"effects"))) {
            execute(`Pt.saved.push(${fileData}); Pt.search = Pt.saved`)
          } else {
            document.getElementById("fileError").classList.add("active");
          }
        })
      });
    } else {
      document.getElementById("fileError").classList.add("active");
    }
  }
})
document.getElementById("customTheme").addEventListener("click", function(e) {
  if(e.target.checked) {
    execute(`
      T[Ct].theme_CUSTOM = "Custom theme";
      Et.settings.menu.pages[1].items[1].options.push(10);
      Et.settings.menu.pages[1].items[1].labels.push('theme_CUSTOM');
      Et.settings.themeSel = 10;
    `);
  } else {
    execute(`
      Et.settings.menu.pages[1].items[1].options = Et.settings.menu.pages[1].items[1].options.filter((v,i,a) => {return v != 10});
      Et.settings.menu.pages[1].items[1].labels = Et.settings.menu.pages[1].items[1].labels.filter((v,i,a) => {return v != 'theme_CUSTOM'});
      Et.settings.themeSel = Et.settings.themeSel == 10 ? 0 : Et.settings.themeSel;
    `)
  }
  userSettings.customTheme = e.target.checked;
  chrome.storage.local.set({Settings:userSettings}, function() {
    console.log(`Custom Theme is set to ${userSettings.customTheme}`);
  });
});
document.getElementById("additionalThemes").addEventListener("click", function(e) {
  if(e.target.checked) {
    execute(`
      T[Ct].theme_gufo = "Gufo's theme";
      T[Ct].theme_floopy = "Floopy's theme";
      T[Ct].theme_shia = "Shia's theme";
      T[Ct].theme_lilyyy = "Lilyyy's theme";
      T[Ct].theme_axye = "Axye's theme";
      Et.settings.menu.pages[1].items[1].options.push(11, 12, 13, 14, 15);
      Et.settings.menu.pages[1].items[1].labels.push('theme_gufo', 'theme_floopy', 'theme_shia', 'theme_lilyyy', 'theme_axye');
    `);
  } else {
    execute(`
      Et.settings.menu.pages[1].items[1].options = Et.settings.menu.pages[1].items[1].options.filter((v,i,a) => {return ![11,12,13,14,15].includes(v)});
      Et.settings.menu.pages[1].items[1].labels = Et.settings.menu.pages[1].items[1].labels.filter((v,i,a) => {return !['theme_gufo','theme_floopy','theme_shia','theme_lilyyy','theme_axye'].includes(v)});
      Et.settings.themeSel = [11,12,13,14,15].includes(Et.settings.themeSel) ? 0 : Et.settings.themeSel;
    `)
  }
  let ID = e.target.id;
  userSettings[ID] = e.target.checked;
  chrome.storage.local.set({Settings:userSettings}, function() {
  console.log(`${ID} is set to ${userSettings[ID]}`);
  });
});
