module.exports = function handler(req, res) {
  var fs = require('fs');
  var path = require('path');

  if (req.method === 'POST') {
    var body = '';
    req.on('data', function(chunk) { body += chunk.toString(); });
    req.on('end', function() {
      try {
        var parsed = JSON.parse(body);
        if (parsed.passcode === process.env.PASSCODE) {
          res.setHeader('Set-Cookie', 'auth=granted; HttpOnly; Path=/; Max-Age=28800; SameSite=Strict');
          res.status(200).json({ success: true });
        } else {
          res.status(401).json({ error: 'Incorrect passcode' });
        }
      } catch (e) {
        res.status(400).json({ error: 'Bad request' });
      }
    });
    return;
  }

  var cookies = req.headers.cookie || '';
  var isAuthed = cookies.split(';').some(function(c) { return c.trim() === 'auth=granted'; });

  res.setHeader('Content-Type', 'text/html');

  if (isAuthed) {
    res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Worker Consent Form — Project Setup</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { font-family: 'Poppins', sans-serif; background: #F0F4F8; color: #2B2A29; }

  .page-header { background: #fff; padding: 0 32px; border-bottom: 1px solid rgba(43,42,41,0.10); display: flex; align-items: center; justify-content: space-between; height: 60px; }
  .breadcrumb { font-size: 12px; color: #727271; display: flex; align-items: center; gap: 6px; }
  .breadcrumb a { color: #00346B; text-decoration: none; }
  .breadcrumb span { color: #B3B3B2; }
  .page-title { font-size: 18px; font-weight: 600; color: #2B2A29; }
  .header-actions { display: flex; gap: 10px; }
  .btn { font-size: 13px; font-weight: 500; border-radius: 100px; padding: 8px 22px; cursor: pointer; font-family: 'Poppins', sans-serif; border: none; }
  .btn-primary { background: #00346B; color: #fff; }
  .btn-primary:hover { background: #00294F; }
  .btn-secondary { background: none; border: 1px solid rgba(43,42,41,0.20); color: #2B2A29; }

  .page-body { padding: 28px 32px; max-width: 1100px; }
  .card { background: #fff; border: 1px solid rgba(43,42,41,0.10); border-radius: 10px; margin-bottom: 20px; overflow: hidden; }
  .card-header { padding: 20px 24px 16px; border-bottom: 1px solid rgba(43,42,41,0.08); }
  .card-title { font-size: 16px; font-weight: 600; color: #2B2A29; }
  .card-body { padding: 20px 24px; }

  .cft-table { width: 100%; border-collapse: collapse; }
  .cft-table th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: #727271; padding: 0 0 10px; text-align: left; border-bottom: 1px solid rgba(43,42,41,0.10); }
  .cft-table th.r { text-align: right; }
  .cft-table td { padding: 14px 0; border-bottom: 1px solid rgba(43,42,41,0.06); vertical-align: middle; }
  .cft-table tr:last-child td { border-bottom: none; }

  .badge { display: inline-flex; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; border-radius: 100px; padding: 2px 9px; }
  .badge-std { background: rgba(0,52,107,0.08); color: #00346B; }
  .badge-cust { background: rgba(27,177,97,0.10); color: #0F6E56; }

  .fname { font-size: 13px; font-weight: 500; color: #2B2A29; margin-bottom: 3px; }
  .fname.dim { color: #B3B3B2; }
  .fmeta { font-size: 11px; color: #727271; }
  .fmeta.dim { color: #B3B3B2; }

  .row-actions { display: flex; gap: 10px; justify-content: flex-end; align-items: center; }
  .abtn { font-size: 12px; font-weight: 500; border-radius: 100px; padding: 5px 14px; cursor: pointer; font-family: 'Poppins', sans-serif; border: none; }
  .abtn-view { background: rgba(0,52,107,0.06); color: #00346B; border: 1px solid rgba(0,52,107,0.18); }
  .abtn-del { background: none; color: #DF252A; border: 1px solid rgba(223,37,42,0.25); }

  .tog-wrap { display: flex; align-items: center; gap: 8px; }
  .tog { width: 36px; height: 20px; border-radius: 10px; background: #00346B; position: relative; cursor: pointer; flex-shrink: 0; }
  .tog.off { background: rgba(43,42,41,0.20); }
  .tog.locked { opacity: 0.35; cursor: not-allowed; }
  .tog::after { content: ''; width: 14px; height: 14px; border-radius: 50%; background: #fff; position: absolute; top: 3px; left: 19px; }
  .tog.off::after { left: 3px; }
  .tog-label { font-size: 11px; color: #727271; }

  .sep-row td { padding: 12px 0 6px; }
  .sep-inner { display: flex; align-items: center; gap: 10px; }
  .sep-label { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: #B3B3B2; }
  .sep-line { flex: 1; height: 1px; background: rgba(43,42,41,0.08); }

  .add-wrap { padding-top: 16px; border-top: 1px solid rgba(43,42,41,0.08); margin-top: 4px; }
  .add-btn { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; font-weight: 500; color: #00346B; background: none; border: 1px dashed rgba(0,52,107,0.30); border-radius: 8px; padding: 9px 18px; cursor: pointer; font-family: 'Poppins', sans-serif; }

  /* Modals */
  .mo { position: fixed; inset: 0; background: rgba(43,42,41,0.45); z-index: 500; display: flex; align-items: center; justify-content: center; }
  .mo.hidden { display: none; }
  .mdl { background: #fff; border-radius: 12px; padding: 28px; width: 520px; box-shadow: 0 8px 40px rgba(0,0,0,0.12); max-height: 90vh; overflow-y: auto; }
  .mdl-wide { width: 640px; max-height: 80vh; display: flex; flex-direction: column; }
  .mdl-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .mdl-title { font-size: 16px; font-weight: 600; color: #2B2A29; }
  .mdl-x { background: none; border: none; cursor: pointer; color: #727271; }
  .mdl-sec { margin-bottom: 18px; }
  .mdl-lbl { font-size: 12px; font-weight: 500; color: #2B2A29; margin-bottom: 8px; display: flex; gap: 4px; }
  .req { color: #DF252A; }
  .mdl-foot { display: flex; justify-content: flex-end; gap: 10px; }

  /* Type cards */
  .topt { border: 1.5px solid rgba(43,42,41,0.18); border-radius: 8px; padding: 12px 14px; cursor: pointer; }
  .topt.sel { border-color: #00346B; background: rgba(0,52,107,0.05); }
  .topt-lbl { font-size: 13px; font-weight: 500; color: #2B2A29; display: flex; align-items: center; gap: 8px; }
  .topt-sub { font-size: 11px; color: #727271; margin-top: 3px; }
  .rc { width: 16px; height: 16px; border-radius: 50%; border: 1.5px solid rgba(43,42,41,0.25); flex-shrink: 0; }
  .topt.sel .rc { border-color: #00346B; background: #00346B; box-shadow: inset 0 0 0 3px #fff; }

  /* Input */
  .minput { width: 100%; border: 1px solid rgba(43,42,41,0.20); border-radius: 8px; padding: 10px 14px; font-size: 13px; color: #2B2A29; font-family: 'Poppins', sans-serif; background: rgba(228,231,233,0.25); outline: none; }
  .minput:focus { border-color: #00346B; background: #fff; }
  .minput.err { border-color: #DF252A; background: #FFF8F8; }
  .err-msg { font-size: 11px; color: #DF252A; margin-top: 6px; }

  /* Upload */
  .upzone { border: 1.5px dashed rgba(43,42,41,0.22); border-radius: 8px; padding: 24px 16px; text-align: center; cursor: pointer; background: rgba(228,231,233,0.15); }
  .upzone.has { border-color: #1BB161; background: rgba(27,177,97,0.04); }
  .upzone.err { border-color: #DF252A; background: #FFF8F8; }
  .up-icon { width: 36px; height: 36px; margin: 0 auto 10px; background: rgba(0,52,107,0.08); border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .up-text { font-size: 13px; font-weight: 500; color: #00346B; margin-bottom: 3px; }
  .up-sub { font-size: 11px; color: #727271; }
  .up-fname { font-size: 13px; font-weight: 500; color: #0F6E56; margin-top: 6px; }

  /* Replace option */
  .ropt { display: flex; align-items: flex-start; gap: 12px; border: 1.5px solid rgba(43,42,41,0.18); border-radius: 8px; padding: 12px 14px; cursor: pointer; margin-bottom: 8px; }
  .ropt.sel { border-color: #00346B; background: rgba(0,52,107,0.05); }
  .ropt .rc2 { width: 16px; height: 16px; min-width: 16px; border-radius: 50%; border: 1.5px solid rgba(43,42,41,0.25); margin-top: 2px; }
  .ropt.sel .rc2 { border-color: #00346B; background: #00346B; box-shadow: inset 0 0 0 3px #fff; }

  .wbox { display: flex; gap: 10px; background: rgba(245,154,0,0.08); border: 1px solid rgba(245,154,0,0.35); border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; font-size: 13px; color: #2B2A29; line-height: 1.6; }

  /* Lang tabs */
  .ltabs { display: flex; border-bottom: 1px solid rgba(43,42,41,0.10); margin-bottom: 16px; flex-shrink: 0; }
  .ltab { font-size: 13px; padding: 8px 16px; cursor: pointer; background: none; border: none; border-bottom: 2px solid transparent; font-family: 'Poppins', sans-serif; color: #727271; }
  .ltab.on { color: #00346B; border-bottom-color: #00346B; font-weight: 500; }
</style>
</head>
<body>

<div class="page-header">
  <div>
    <div class="breadcrumb"><a href="#">Projects</a><span>›</span><span>Kate's Third Testing Project</span></div>
    <div class="page-title">13. Worker Consent Form</div>
  </div>
  <div class="header-actions">
    <button class="btn btn-secondary">Back</button>
    <button class="btn btn-primary">Next</button>
  </div>
</div>

<div class="page-body">
  <div class="card">
    <div class="card-header"><div class="card-title">Consent Form Types</div></div>
    <div class="card-body">
      <div style="display:flex;align-items:flex-start;gap:12px;background:rgba(245,154,0,0.08);border:1px solid rgba(245,154,0,0.35);border-radius:8px;padding:12px 16px;margin-bottom:12px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:1px;"><path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="#F59A00" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6v3.5M8 11v.5" stroke="#F59A00" stroke-width="1.3" stroke-linecap="round"/></svg>
        <div style="font-size:12px;color:#2B2A29;line-height:1.7;">
          <strong style="font-weight:600;">Custom forms in worker onboarding:</strong> Custom forms will be presented to workers in the order they were added. Existing workers who have already completed onboarding will not be shown the standard forms again, but will be required to review and apply their signature to all custom forms added to this project.
        </div>
      </div>

      <!-- Info rules (collapsible) -->
      <div style="margin-bottom:20px;">
        <div id="infoToggle" style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;font-size:12px;color:#00346B;font-weight:500;">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;"><circle cx="8" cy="8" r="7" stroke="#00346B" stroke-width="1.2"/><path d="M8 5v.5M8 7.5v4" stroke="#00346B" stroke-width="1.3" stroke-linecap="round"/></svg>
          <span id="infoToggleText">How do standard and custom forms work?</span>
          <svg id="infoChevron" width="12" height="12" viewBox="0 0 12 12" fill="none" style="transition:transform 0.2s;"><path d="M3 5l3 3 3-3" stroke="#00346B" stroke-width="1.2" stroke-linecap="round"/></svg>
        </div>
        <div id="infoPanel" style="display:none;margin-top:10px;background:rgba(0,52,107,0.03);border:1px solid rgba(0,52,107,0.10);border-radius:8px;padding:14px 18px;">
          <div style="font-size:12px;color:#2B2A29;line-height:1.85;">
            <div style="font-weight:600;margin-bottom:8px;color:#00346B;">Standard forms</div>
            <div style="margin-bottom:4px;">Every project includes two standard forms by default: a <strong>Consent Form</strong> and a <strong>Biometric Consent Form</strong>.</div>
            <div style="margin-bottom:4px;">Standard forms can only be turned off once a custom form of the same type has been uploaded.</div>
            <div style="margin-bottom:12px;">Turning a standard form back on is always allowed.</div>

            <div style="font-weight:600;margin-bottom:8px;color:#00346B;">Custom forms</div>
            <div style="margin-bottom:4px;">You can upload multiple custom forms per type. Custom forms can be freely toggled on or off.</div>
            <div style="margin-bottom:4px;">Custom forms can exist <strong>alongside</strong> standard forms or <strong>replace</strong> them.</div>
            <div style="margin-bottom:12px;">When turning off a standard form, you will be asked to select which custom form replaces it.</div>

            <div style="font-weight:600;margin-bottom:8px;color:#00346B;">Deleting a custom form</div>
            <div style="margin-bottom:4px;">If the custom form is currently replacing a standard form and other custom forms of the same type exist, you will be asked to select a new replacement.</div>
            <div>If it is the only custom form replacing a standard form, the standard form will be automatically restored.</div>
          </div>
        </div>
      </div>
      <table class="cft-table">
        <thead><tr>
          <th style="width:100px;">Type</th>
          <th>Form Name</th>
          <th class="r" style="width:180px;">Actions</th>
          <th class="r" style="width:80px;"></th>
        </tr></thead>
        <tbody id="tbody"></tbody>
      </table>
      <div class="add-wrap">
        <button class="add-btn" id="btnAdd">
          <svg viewBox="0 0 14 14" fill="none" width="14" height="14"><path d="M7 1v12M1 7h12" stroke="#00346B" stroke-width="1.5" stroke-linecap="round"/></svg>
          Add Custom Form
        </button>
      </div>
    </div>
  </div>
</div>

<!-- View Modal -->
<div class="mo hidden" id="moView">
  <div class="mdl mdl-wide">
    <div class="mdl-hdr">
      <div class="mdl-title" id="viewTitle"></div>
      <button class="mdl-x" id="viewClose">✕</button>
    </div>
    <div class="ltabs">
      <button class="ltab on" id="viewEn">English</button>
      <button class="ltab" id="viewEs">Spanish</button>
    </div>
    <div id="viewBody" style="overflow-y:auto;flex:1;"></div>
  </div>
</div>

<!-- Upload Modal -->
<div class="mo hidden" id="moUpload">
  <div class="mdl">
    <div class="mdl-hdr">
      <div class="mdl-title">Add Custom Form</div>
      <button class="mdl-x" id="upClose">✕</button>
    </div>

    <div class="mdl-sec">
      <div class="mdl-lbl">Form Type <span class="req">*</span></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
        <div class="topt sel" id="toptC">
          <div class="topt-lbl"><div class="rc"></div>Consent Form</div>
          <div class="topt-sub">Supplements or replaces the standard consent form</div>
        </div>
        <div class="topt" id="toptB">
          <div class="topt-lbl"><div class="rc"></div>Biometric Consent Form</div>
          <div class="topt-sub">Supplements or replaces the standard biometric form</div>
        </div>
      </div>
    </div>

    <div class="mdl-sec">
      <div class="mdl-lbl">Form Name <span class="req">*</span></div>
      <input class="minput" type="text" id="inpName" placeholder="Enter a name for this form"/>
      <div class="err-msg" id="errName" style="display:none;"></div>
    </div>

    <div class="mdl-sec">
      <div class="mdl-lbl">Upload Document <span class="req">*</span> <span style="font-size:11px;color:#727271;font-weight:400;">— .docx only</span></div>
      <div class="upzone" id="upzone">
        <div class="up-icon"><svg viewBox="0 0 18 18" fill="none" width="18" height="18"><path d="M9 12V3M5 6l4-4 4 4" stroke="#00346B" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 13v1a2 2 0 002 2h10a2 2 0 002-2v-1" stroke="#00346B" stroke-width="1.4" stroke-linecap="round"/></svg></div>
        <div class="up-text">Click to upload</div>
        <div class="up-sub">Word document (.docx)</div>
        <div class="up-fname" id="upFname" style="display:none;"></div>
      </div>
      <div class="err-msg" id="errFile" style="display:none;"></div>
      <input type="file" id="finput" accept=".docx" style="display:none;"/>
    </div>

    <div class="mdl-foot">
      <button class="btn btn-secondary" id="upCancel">Cancel</button>
      <button class="btn btn-primary" id="upSubmit">Add Form</button>
    </div>
  </div>
</div>

<!-- Replace Modal -->
<div class="mo hidden" id="moReplace">
  <div class="mdl">
    <div class="mdl-hdr">
      <div class="mdl-title" id="repTitle">Select Replacement Form</div>
      <button class="mdl-x" id="repClose">✕</button>
    </div>
    <p id="repDesc" style="font-size:13px;color:#727271;margin-bottom:16px;line-height:1.6;"></p>
    <div id="repList" style="margin-bottom:20px;"></div>
    <div class="mdl-foot">
      <button class="btn btn-secondary" id="repCancel">Cancel</button>
      <button class="btn btn-primary" id="repConfirm">Confirm</button>
    </div>
  </div>
</div>

<!-- Warn Modal -->
<div class="mo hidden" id="moWarn">
  <div class="mdl">
    <div class="mdl-hdr">
      <div class="mdl-title">Restore Standard Form?</div>
      <button class="mdl-x" id="warnClose">✕</button>
    </div>
    <div class="wbox">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="flex-shrink:0;margin-top:2px;"><path d="M8 1.5L14.5 13H1.5L8 1.5z" stroke="#F59A00" stroke-width="1.3" stroke-linejoin="round"/><path d="M8 6v3.5M8 11v.5" stroke="#F59A00" stroke-width="1.3" stroke-linecap="round"/></svg>
      <span id="warnText"></span>
    </div>
    <div class="mdl-foot">
      <button class="btn btn-secondary" id="warnCancel">Cancel</button>
      <button class="btn btn-primary" id="warnConfirm">Confirm</button>
    </div>
  </div>
</div>

<script>
(function(){
  // STATE
  var registry = {};
  var stdOff = { consent: null, biometric: null };
  var upType = 'consent';
  var upFile = null;
  var pending = null;
  var selReplace = null;
  var pendingWarn = null;

  // FORM CONTENT
  var FORMS = {
    consent: {
      title: 'FCA Authorization Regarding Credentialing and Analytics',
      en: '<div style="font-size:13px;color:#2B2A29;line-height:1.8;"><p style="font-weight:600;margin-bottom:8px;">Disclosure</p><p style="margin-bottom:16px;">The information requested above is necessary to onboard you and issue your Project badge. Field Control Analytics ("FCA") will collect, store, and use the information above, and Your photograph, in order to identify You for the purpose of allowing You access to the jobsite. FCA will store the Personal Information until you request that such information be removed from FCA\\'s database.</p><p style="font-weight:600;margin-bottom:8px;">Consent</p><p>By signing below, I represent that I understand and consent that my Personal Information may be collected, stored, and used for identification purposes by FCA, the General Contractor and/or its agents and subcontractors as part of the Services.</p></div>',
      es: '<div style="font-size:13px;color:#2B2A29;line-height:1.8;"><p style="font-weight:600;margin-bottom:8px;">Divulgación</p><p style="margin-bottom:16px;">La información solicitada es necesaria para incorporarlo y emitir su credencial de Proyecto. Field Control Analytics ("FCA") recopilará, almacenará y utilizará la información y su fotografía con el fin de identificarlo para permitirle el acceso al lugar de trabajo.</p><p style="font-weight:600;margin-bottom:8px;">Consentimiento</p><p>Al firmar, declaro que entiendo y doy mi consentimiento para que mi Información Personal sea recopilada, almacenada y utilizada con fines de identificación.</p></div>'
    },
    biometric: {
      title: 'FCA Biometric Consent Form',
      en: '<div style="font-size:13px;color:#2B2A29;line-height:1.8;"><p style="margin-bottom:16px;">My information may be collected, captured, obtained, stored, and used by Field Control Analytics ("FCA") and for identification purposes. FCA may collect, capture, obtain, store, transmit, maintain, process, derive, and use my biometric information for its use related to the Services or for identification and credentialing.</p><p>My information will be retained by FCA until I request, in writing, that FCA delete such information.</p></div>',
      es: '<div style="font-size:13px;color:#2B2A29;line-height:1.8;"><p style="margin-bottom:16px;">Mi información puede ser recopilada, capturada, obtenida, almacenada y utilizada por Field Control Analytics ("FCA") con fines de identificación. FCA puede recopilar, capturar, obtener, almacenar, transmitir, mantener, procesar, derivar y utilizar mi información biométrica.</p><p>Mi información será retenida por FCA hasta que solicite su eliminación por escrito.</p></div>'
    }
  };

  // ELEMENTS
  var $tbody = document.getElementById('tbody');
  var $moView = document.getElementById('moView');
  var $moUpload = document.getElementById('moUpload');
  var $moReplace = document.getElementById('moReplace');
  var $moWarn = document.getElementById('moWarn');
  var $inpName = document.getElementById('inpName');
  var $errName = document.getElementById('errName');
  var $upzone = document.getElementById('upzone');
  var $errFile = document.getElementById('errFile');
  var $finput = document.getElementById('finput');
  var $upFname = document.getElementById('upFname');

  // RENDER TABLE
  function render() {
    var html = '';
    // Standard consent
    html += stdRow('consent', 'FCA Authorization Regarding Credentialing and Analytics', 'Standard Consent Form · Applied automatically to all projects');
    // Standard biometric
    html += stdRow('biometric', 'FCA Biometric Consent Form', 'Standard Biometric Consent Form · Applied automatically to all projects');
    // Separator + customs
    var ids = Object.keys(registry);
    if (ids.length > 0) {
      html += '<tr class="sep-row"><td colspan="4"><div class="sep-inner"><span class="sep-label">Custom Forms</span><div class="sep-line"></div></div></td></tr>';
      ids.forEach(function(id) {
        var f = registry[id];
        var tl = f.type === 'consent' ? 'Consent Form' : 'Biometric Consent Form';
        var dim = f.on ? '' : ' dim';
        var togCls = f.on ? 'tog' : 'tog off';
        var togLbl = f.on ? 'On' : 'Off';
        html += '<tr>';
        html += '<td><span class="badge badge-cust">Custom</span></td>';
        html += '<td><div class="fname' + dim + '">' + f.name + '</div><div class="fmeta' + dim + '">Custom ' + tl + ' · ' + f.fileName + '</div></td>';
        html += '<td><div class="row-actions"><button class="abtn abtn-view" data-cview="' + id + '">View</button><div class="tog-wrap"><div class="' + togCls + '" data-ctog="' + id + '"></div><span class="tog-label">' + togLbl + '</span></div></div></td>';
        html += '<td style="text-align:right;"><button class="abtn abtn-del" data-cdel="' + id + '">Delete</button></td>';
        html += '</tr>';
      });
    }
    $tbody.innerHTML = html;
    bindTable();
  }

  function stdRow(type, name, meta) {
    var isOff = !!stdOff[type];
    var hasCustom = Object.keys(registry).some(function(id) { return registry[id].type === type; });
    var dim = isOff ? ' dim' : '';
    var togCls = isOff ? 'tog off' : 'tog';
    if (!hasCustom && !isOff) togCls += ' locked';
    var togLbl = isOff ? 'Off' : 'On';
    var h = '<tr>';
    h += '<td><span class="badge badge-std">Standard</span></td>';
    h += '<td><div class="fname' + dim + '">' + name + '</div><div class="fmeta' + dim + '">' + meta + '</div></td>';
    h += '<td><div class="row-actions"><button class="abtn abtn-view" data-sview="' + type + '">View</button><div class="tog-wrap"><div class="' + togCls + '" data-stog="' + type + '"></div><span class="tog-label">' + togLbl + '</span></div></div></td>';
    h += '<td></td>';
    h += '</tr>';
    return h;
  }

  function bindTable() {
    $tbody.querySelectorAll('[data-sview]').forEach(function(el) {
      el.addEventListener('click', function() { openView(el.getAttribute('data-sview')); });
    });
    $tbody.querySelectorAll('[data-stog]').forEach(function(el) {
      el.addEventListener('click', function() { toggleStd(el.getAttribute('data-stog')); });
    });
    $tbody.querySelectorAll('[data-cview]').forEach(function(el) {
      el.addEventListener('click', function() { alert('Custom form preview not available for uploaded documents.'); });
    });
    $tbody.querySelectorAll('[data-ctog]').forEach(function(el) {
      el.addEventListener('click', function() { toggleCustom(el.getAttribute('data-ctog')); });
    });
    $tbody.querySelectorAll('[data-cdel]').forEach(function(el) {
      el.addEventListener('click', function() { deleteCustom(el.getAttribute('data-cdel')); });
    });
  }

  // VIEW MODAL
  var curView = null;
  var curLang = 'en';

  function openView(type) {
    curView = type; curLang = 'en';
    document.getElementById('viewTitle').textContent = FORMS[type].title;
    document.getElementById('viewBody').innerHTML = FORMS[type].en;
    document.getElementById('viewEn').className = 'ltab on';
    document.getElementById('viewEs').className = 'ltab';
    $moView.classList.remove('hidden');
  }
  document.getElementById('viewClose').addEventListener('click', function() { $moView.classList.add('hidden'); });
  document.getElementById('viewEn').addEventListener('click', function() {
    curLang = 'en';
    document.getElementById('viewBody').innerHTML = FORMS[curView].en;
    document.getElementById('viewEn').className = 'ltab on';
    document.getElementById('viewEs').className = 'ltab';
  });
  document.getElementById('viewEs').addEventListener('click', function() {
    curLang = 'es';
    document.getElementById('viewBody').innerHTML = FORMS[curView].es;
    document.getElementById('viewEs').className = 'ltab on';
    document.getElementById('viewEn').className = 'ltab';
  });

  // UPLOAD MODAL
  document.getElementById('btnAdd').addEventListener('click', function() {
    upType = 'consent'; upFile = null;
    $inpName.value = '';
    $inpName.className = 'minput';
    $errName.style.display = 'none'; $errName.textContent = '';
    $upzone.className = 'upzone';
    $errFile.style.display = 'none'; $errFile.textContent = '';
    $upFname.style.display = 'none'; $upFname.textContent = '';
    $finput.value = '';
    document.getElementById('toptC').className = 'topt sel';
    document.getElementById('toptB').className = 'topt';
    $moUpload.classList.remove('hidden');
  });
  document.getElementById('upClose').addEventListener('click', function() { $moUpload.classList.add('hidden'); });
  document.getElementById('upCancel').addEventListener('click', function() { $moUpload.classList.add('hidden'); });

  document.getElementById('toptC').addEventListener('click', function() {
    upType = 'consent';
    document.getElementById('toptC').className = 'topt sel';
    document.getElementById('toptB').className = 'topt';
  });
  document.getElementById('toptB').addEventListener('click', function() {
    upType = 'biometric';
    document.getElementById('toptB').className = 'topt sel';
    document.getElementById('toptC').className = 'topt';
  });

  $upzone.addEventListener('click', function() { $finput.click(); });
  $finput.addEventListener('change', function() {
    if ($finput.files && $finput.files[0]) {
      upFile = $finput.files[0];
      $upzone.className = 'upzone has';
      $upFname.textContent = upFile.name;
      $upFname.style.display = 'block';
      $errFile.style.display = 'none';
      $errFile.textContent = '';
    }
  });

  $inpName.addEventListener('input', function() {
    $inpName.className = 'minput';
    $errName.style.display = 'none';
    $errName.textContent = '';
  });

  document.getElementById('upSubmit').addEventListener('click', function() {
    var name = $inpName.value.trim();
    var nameOk = true;
    var fileOk = true;

    // Reset
    $inpName.className = 'minput';
    $errName.style.display = 'none'; $errName.textContent = '';
    $upzone.className = upFile ? 'upzone has' : 'upzone';
    $errFile.style.display = 'none'; $errFile.textContent = '';

    // Validate name
    if (!name) {
      $inpName.className = 'minput err';
      $errName.textContent = 'Please enter a form name.';
      $errName.style.display = 'block';
      nameOk = false;
    } else {
      var dupName = Object.keys(registry).some(function(id) {
        return registry[id].name.toLowerCase() === name.toLowerCase();
      });
      if (dupName) {
        $inpName.className = 'minput err';
        $errName.textContent = 'A custom form with this name already exists. Please use a different name.';
        $errName.style.display = 'block';
        nameOk = false;
      }
    }

    // Validate file
    if (!upFile) {
      $upzone.className = 'upzone err';
      $errFile.textContent = 'Please upload a .docx file.';
      $errFile.style.display = 'block';
      fileOk = false;
    } else {
      var dupFile = Object.keys(registry).some(function(id) {
        return registry[id].fileName === upFile.name;
      });
      if (dupFile) {
        $upzone.className = 'upzone err';
        $errFile.textContent = 'This document has already been uploaded. Please use a different file.';
        $errFile.style.display = 'block';
        fileOk = false;
      }
    }

    if (!nameOk || !fileOk) return;

    // Valid — add to registry
    var id = 'c' + Date.now();
    registry[id] = { name: name, type: upType, fileName: upFile.name, on: false };
    $moUpload.classList.add('hidden');
    render();
  });

  // STANDARD TOGGLE
  function toggleStd(type) {
    var hasCustom = Object.keys(registry).some(function(id) { return registry[id].type === type; });
    if (!hasCustom && !stdOff[type]) return; // locked

    if (!stdOff[type]) {
      // Turn off — select replacement
      var matches = [];
      Object.keys(registry).forEach(function(id) {
        if (registry[id].type === type) matches.push({ id: id, f: registry[id] });
      });
      pending = { kind: 'stdOff', type: type };
      selReplace = null;
      document.getElementById('repTitle').textContent = 'Select Replacement Form';
      document.getElementById('repDesc').textContent = 'The standard form will be turned off. Select which custom form replaces it for this project.';
      renderRepList(matches);
      $moReplace.classList.remove('hidden');
    } else {
      // Turn on
      stdOff[type] = null;
      render();
    }
  }

  // CUSTOM TOGGLE
  function toggleCustom(id) {
    registry[id].on = !registry[id].on;
    render();
  }

  // DELETE CUSTOM
  function deleteCustom(id) {
    var f = registry[id];
    var type = f.type;
    var isReplacing = stdOff[type] === id;
    var others = [];
    Object.keys(registry).forEach(function(oid) {
      if (oid !== id && registry[oid].type === type) others.push({ id: oid, f: registry[oid] });
    });

    if (isReplacing && others.length > 0) {
      pending = { kind: 'delReplace', id: id, type: type };
      selReplace = null;
      document.getElementById('repTitle').textContent = 'Select New Replacement';
      document.getElementById('repDesc').textContent = '"' + f.name + '" is currently replacing the standard form. Select another custom form to replace it before deleting.';
      renderRepList(others);
      $moReplace.classList.remove('hidden');
    } else if (isReplacing && others.length === 0) {
      pendingWarn = { id: id, type: type };
      var tl = type === 'consent' ? 'Consent Form' : 'Biometric Consent Form';
      document.getElementById('warnText').textContent = '"' + f.name + '" is the only custom form replacing the standard ' + tl + '. Deleting it will automatically re-enable the standard form.';
      $moWarn.classList.remove('hidden');
    } else {
      delete registry[id];
      render();
    }
  }

  // REPLACE MODAL
  function renderRepList(matches) {
    var html = '';
    matches.forEach(function(m) {
      html += '<div class="ropt" data-rid="' + m.id + '"><div class="rc2"></div><div><div style="font-size:13px;font-weight:500;color:#2B2A29;">' + m.f.name + '</div><div style="font-size:11px;color:#727271;">' + m.f.fileName + '</div></div></div>';
    });
    document.getElementById('repList').innerHTML = html;
    document.querySelectorAll('.ropt').forEach(function(el) {
      el.addEventListener('click', function() {
        selReplace = el.getAttribute('data-rid');
        document.querySelectorAll('.ropt').forEach(function(r) { r.className = 'ropt'; });
        el.className = 'ropt sel';
      });
    });
  }
  document.getElementById('repClose').addEventListener('click', function() { $moReplace.classList.add('hidden'); });
  document.getElementById('repCancel').addEventListener('click', function() { $moReplace.classList.add('hidden'); });
  document.getElementById('repConfirm').addEventListener('click', function() {
    if (!selReplace) { alert('Please select a form.'); return; }
    $moReplace.classList.add('hidden');
    if (pending.kind === 'stdOff') {
      stdOff[pending.type] = selReplace;
      registry[selReplace].on = true;
    } else if (pending.kind === 'delReplace') {
      stdOff[pending.type] = selReplace;
      registry[selReplace].on = true;
      delete registry[pending.id];
    }
    pending = null; selReplace = null;
    render();
  });

  // WARN MODAL
  document.getElementById('warnClose').addEventListener('click', function() { $moWarn.classList.add('hidden'); });
  document.getElementById('warnCancel').addEventListener('click', function() { $moWarn.classList.add('hidden'); });
  document.getElementById('warnConfirm').addEventListener('click', function() {
    stdOff[pendingWarn.type] = null;
    delete registry[pendingWarn.id];
    pendingWarn = null;
    $moWarn.classList.add('hidden');
    render();
  });

  // INFO PANEL TOGGLE
  var infoOpen = false;
  document.getElementById('infoToggle').addEventListener('click', function() {
    infoOpen = !infoOpen;
    document.getElementById('infoPanel').style.display = infoOpen ? 'block' : 'none';
    document.getElementById('infoChevron').style.transform = infoOpen ? 'rotate(180deg)' : '';
  });

  // INIT
  render();
})();
</script>
</body>
</html>
`);
  } else {
    var gatePath = path.join(process.cwd(), 'public', 'gate.html');
    var gate = fs.readFileSync(gatePath, 'utf8');
    res.status(200).send(gate);
  }
};
