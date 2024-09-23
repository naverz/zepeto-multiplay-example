using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Text.RegularExpressions;
using Unity.EditorCoroutines.Editor;
using UnityEditor;
using UnityEngine;

public class ModuleImporter : EditorWindow
{
    private Content _selectedData;
    private ContentList _contentList;
    private string _lastUpdateTime = "";

    private Language _selectedLanguage = Language.English;
    private readonly string[] _languages = Enum.GetNames(typeof(Language));
    private static EditorWindow _window;
    
    [MenuItem("ZEPETO/Module Importer")]
    public static void ShowWindow()
    {
        Rect windowRect = new Rect(0, 0, ConstantManager.RECT_WIDTH, ConstantManager.RECT_HEIGHT);
        _window = EditorWindow.GetWindowWithRect(typeof(ModuleImporter), windowRect, true, "ZEPETO Module Importer");
    }

    private void OnGUI()
    {
        if (!_window)
        {
            ShowWindow();
        }

        if (_contentList == null)
        {
            _selectedLanguage =
                Application.systemLanguage == SystemLanguage.Korean ? Language.Korean : Language.English;
            DoTopBarGUI();
            EditorCoroutineUtility.StartCoroutine(LoadDataAsync(), this);

            GUILayout.BeginArea(new Rect(position.width * 0.5f, position.height * 0.5f, 400, 100));
            EditorGUILayout.BeginHorizontal();
            {
                GUILayout.Label("Wait...");
            }
            EditorGUILayout.EndHorizontal();
            GUILayout.EndArea();
        }

        else
        {
            DrawAll();
        }
    }


    private void DrawAll()
    {
        DoTopBarGUI();
        GUILayout.BeginHorizontal();

        DoSideButtonGUI();
        if (_selectedData != null)
        {
            GUILayout.BeginVertical();

            DoTopButtonGUI();
            DoVersionInfoGUI();
            DoDescriptionGUI();
            DoDependencyInfoGUI();
            DoPreviewImageGUI();

            GUILayout.EndVertical();
        }

        GUILayout.EndHorizontal();
    }

    private void DoTopBarGUI()
    {
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));

        GUILayout.BeginHorizontal();

        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.alignment = TextAnchor.MiddleLeft;
        labelStyle.fontSize = 24;

        GUILayout.Label("ZEPETO Module Importer", labelStyle);
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));

        GUILayout.FlexibleSpace();
        _selectedLanguage =
            (Language)EditorGUILayout.Popup((int)_selectedLanguage, _languages, GUILayout.Width(150),
                GUILayout.Height(30));

        GUILayout.EndHorizontal();
        GUILayout.Label(" Easily add frequently used modules.", EditorStyles.label);

        GUILayout.Box("", GUILayout.Height(3), GUILayout.ExpandWidth(true));
    }

    private void DoSideButtonGUI()
    {
        const int buttonWidth = 200;
        GUILayout.BeginVertical(GUILayout.Width(buttonWidth));
        if (_selectedData == null)
            _selectedData = _contentList.Items[0] ?? null;

        foreach (Content data in _contentList.Items)
        {
            if (GUILayout.Button("", GUILayout.Width(buttonWidth), GUILayout.Height(30)))
            {
                _selectedData = data;
            }
            
            Rect guiRect = GUILayoutUtility.GetLastRect();
            Rect statusRect = new Rect(guiRect.x + (guiRect.width * 0.02f), guiRect.y, guiRect.width, guiRect.height);
            Rect titleRect = new Rect(guiRect.x + (guiRect.width * 0.12f), guiRect.y, guiRect.width, guiRect.height);
            Rect versionRect = new Rect(guiRect.x + (guiRect.width * 0.82f), guiRect.y, guiRect.width, guiRect.height);
            
            GUI.Label(titleRect, data.Title);
            string version = VersionHandler.VersionCheck(GetRemoveSpace(data.Title) + "Version");
            if (version != "UNKNOWN")
            {
                GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
                GUI.Label(versionRect, version, EditorStyles.miniLabel);
                Texture2D statusTexture = version == data.LatestVersion
                    ? EditorGUIUtility.FindTexture("d_winbtn_mac_max")
                    : EditorGUIUtility.FindTexture("d_winbtn_mac_min");
                GUI.Label(statusRect, statusTexture);
            }
        }

        DoUpdateButtonGUI();
        DoContibuteButtonGUI();
        GUILayout.EndVertical();
        GUILayout.Box("", GUILayout.ExpandHeight(true), GUILayout.Width(3));
    }

    private void DoUpdateButtonGUI()
    {
        GUILayout.BeginHorizontal();

        GUILayout.FlexibleSpace();
        GUILayout.Label("Last Update : " + _lastUpdateTime, EditorStyles.boldLabel, GUILayout.Height(30));
        if (GUILayout.Button(EditorGUIUtility.FindTexture("d_Refresh"), GUILayout.Width(30), GUILayout.Height(30)))
        {
            _contentList = null;
            _lastUpdateTime = "";
            EditorCoroutineUtility.StartCoroutine(LoadDataAsync(), this);
        }

        GUILayout.EndHorizontal();
    }

    private void DoContibuteButtonGUI()
    {
        GUILayout.BeginVertical();
        GUILayout.FlexibleSpace();
        if (GUILayout.Button("Issue Report", GUILayout.Width(200), GUILayout.Height(20)))
        {
            string url = ConstantManager.ISSUE_REPORT_PATH;
            OpenLocalizeURL((url));
        }
        if (GUILayout.Button("Contribute", GUILayout.Width(200), GUILayout.Height(20)))
        {
            string url = ConstantManager.CONTRIBUTE_PATH;
            OpenLocalizeURL(url);
        }

        GUILayout.Space(3);
        GUILayout.EndVertical();
    }

    private void DoTopButtonGUI()
    {
        GUIStyle labelStyle = new GUIStyle(GUI.skin.label);
        labelStyle.alignment = TextAnchor.MiddleLeft;
        labelStyle.fontSize = 20;
        labelStyle.fontStyle = FontStyle.Bold;

        GUILayout.BeginHorizontal();
        GUILayout.Label(_selectedData.Title, labelStyle);
        GUILayout.FlexibleSpace();

        if (GUILayout.Button("View Import Guide", GUILayout.Height(20), GUILayout.ExpandWidth(false)))
        {
            string url = Path.Combine(ConstantManager.REPO_PATH, GetRemoveSpace(_selectedData.Title), ConstantManager.README_PATH);
            OpenLocalizeURL(url);
        }

        if (GUILayout.Button("Import " + _selectedData.LatestVersion, GUILayout.Height(20),
                GUILayout.ExpandWidth(false)))
        {
            string title = GetRemoveSpace(_selectedData.Title);
            string version = "v" + _selectedData.LatestVersion;
            EditorCoroutineUtility.StartCoroutine(ImportHandler.ImportPackage(title, version), this);
        }

        GUILayout.EndHorizontal();

        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
    }

    private void DoVersionInfoGUI()
    {
        string className = GetRemoveSpace(_selectedData.Title) + "Version";
        string downloadedVersion = VersionHandler.VersionCheck(className);

        GUILayout.Label($"Version : {downloadedVersion}", EditorStyles.boldLabel);

        GUIStyle linkStyle = new GUIStyle(GUI.skin.label);
        linkStyle.normal.textColor = new Color(0.0f, 0.47f, 1.0f);
        linkStyle.hover.textColor = Color.yellow;
        linkStyle.fontStyle = FontStyle.Italic;

        GUILayout.BeginHorizontal();

        if (GUILayout.Button("See other version", linkStyle))
        {
            string versionUrl = Path.Combine(ConstantManager.REPO_PATH, GetRemoveSpace(_selectedData.Title));
            Application.OpenURL(versionUrl);
        }

        GUILayout.Label("-");
        if (GUILayout.Button("API Docs", linkStyle))
        {
            string docsUrl = _selectedData.DocsUrl;
            OpenLocalizeURL(docsUrl);
        }

        GUILayout.FlexibleSpace();

        GUILayout.EndHorizontal();

        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
    }

    private void DoDependencyInfoGUI()
    {
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
        GUILayout.Label("Dependencies", EditorStyles.boldLabel);
        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
        GUILayout.Label("Is Using", EditorStyles.boldLabel);

        GUILayout.BeginVertical();
        foreach (string dependency in _selectedData.Dependencies)
        {
            GUILayout.Label("\t" + dependency, EditorStyles.label);
        }

        GUILayout.EndVertical();


        GUILayout.Box("", GUILayout.ExpandWidth(true), GUILayout.Height(3));
    }

    private void DoDescriptionGUI()
    {
        GUIStyle style = new GUIStyle();
        style.wordWrap = true;
        style.normal.textColor = Color.white;

        GUILayout.Label(_selectedLanguage == 0 ? _selectedData.Description : _selectedData.Description_ko, style);
    }

    private void DoPreviewImageGUI()
    {
        GUILayout.Label("Preview", EditorStyles.boldLabel);
        GUILayout.BeginHorizontal();
        GUILayout.FlexibleSpace();
        if (_selectedData.previewImage)
            GUILayout.Box(_selectedData.previewImage, GUILayout.Width(_selectedData.previewImage.width),
                GUILayout.Height(_selectedData.previewImage.height));
        GUILayout.FlexibleSpace();
        GUILayout.EndHorizontal();
    }

    private IEnumerator LoadDataAsync()
    {
        yield return DownloadGithubHandler.GetDataAsync((data) =>
        {
            if (_contentList == null && data != null)
            {
                _contentList = JsonUtility.FromJson<ContentList>(data);
                _lastUpdateTime = DateTime.Now.ToString("HH:mm");
                for (int i = 0; i < _contentList.Items.Count; i++)
                {
                    EditorCoroutineUtility.StartCoroutine(LoadImageAsync(i), this);
                }
            }
        });
    }

    private IEnumerator LoadImageAsync(int i)
    {
        string url = Path.Combine(ConstantManager.DOWNLOAD_PATH, GetRemoveSpace(_contentList.Items[i].Title),
            "Preview.png");
        yield return DownloadGithubHandler.GetTextureAsync(url, (texture) =>
        {
            if (texture != null)
                _contentList.Items[i].previewImage = texture;
        });
    }

    private void OpenLocalizeURL(string url)
    {
        string localizeUrl = url;

        switch (_selectedLanguage)
        {
            case Language.Korean:
                localizeUrl = Regex.Replace(url, "lang-en", "lang-ko");
                localizeUrl = Regex.Replace(url, ".md", "_KR.md");
                break;

            case Language.English:
            default:
                break;
        }

        Application.OpenURL(localizeUrl);
    }

    private string GetRemoveSpace(string s)
    {
        return s.Replace(" ", "");
    }

    [System.Serializable]
    public class Content
    {
        public string Title;
        public string Description;
        public string Description_ko;
        public string DocsUrl;
        public string LatestVersion;
        public string[] Dependencies;
        public Texture2D previewImage;
    }

    [System.Serializable]
    public class ContentList
    {
        public List<Content> Items;
    }

    public enum Language
    {
        English = 0,
        Korean = 1
    }
}