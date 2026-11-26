<?php
declare(strict_types=1);

// ---- Configuration -------------------------------------------------------
// Adresse qui reçoit les demandes de devis (à vérifier avant mise en ligne).
const TO   = 'thibault.lbrt21@gmail.com';
const FROM = 'no-reply@webzly.fr';   // doit appartenir au domaine hébergé
const RATE_LIMIT_SECONDS = 30;
// --------------------------------------------------------------------------

$TO = TO;

$wantsJson = isset($_SERVER['HTTP_ACCEPT']) && stripos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function respond(bool $ok, int $status, string $error, bool $json): void {
    if ($json) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        header('Cache-Control: no-store');
        echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'error' => $error], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: contact.html#' . ($ok ? 'merci' : 'erreur'), true, 303);
    }
    exit;
}

// Remove control chars (incl. CR/LF) for single-line values.
function line(mixed $v, int $max): string {
    if (!is_string($v)) return '';
    $v = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $v) ?? '';
    $v = trim(preg_replace('/\s{2,}/u', ' ', $v) ?? '');
    return mb_substr($v, 0, $max);
}

// Multi-line text: normalise newlines, drop other control chars.
function text(mixed $v, int $max): string {
    if (!is_string($v)) return '';
    $v = str_replace(["\r\n", "\r"], "\n", $v);
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(false, 405, 'Méthode non autorisée.', $wantsJson);
}

// Honeypot: pretend success so bots learn nothing.
if (!empty($_POST['website'])) {
    respond(true, 200, '', $wantsJson);
}

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$now = time();
if (isset($_SESSION['last_send']) && ($now - (int)$_SESSION['last_send']) < RATE_LIMIT_SECONDS) {
    respond(false, 429, 'Merci de patienter quelques secondes avant un nouvel envoi.', $wantsJson);
}

$nom        = line($_POST['nom'] ?? '', 100);
$entreprise = line($_POST['entreprise'] ?? '', 120);
$metier     = line($_POST['metier'] ?? '', 100);
$telephone  = line($_POST['telephone'] ?? '', 30);
$email      = line($_POST['email'] ?? '', 150);
$formule    = line($_POST['formule'] ?? '', 80);
$delai      = line($_POST['delai'] ?? '', 80);
$abonnement = line($_POST['abonnement'] ?? '', 80);
$rdvMode    = line($_POST['rdv_mode'] ?? '', 80);
$rdvMoment  = line($_POST['rdv_moment'] ?? '', 80);
$siteActuel = line($_POST['site_actuel'] ?? '', 200);
$message    = text($_POST['message'] ?? '', 3000);
$consent    = !empty($_POST['consent']);

$besoins = [];
if (isset($_POST['besoins']) && is_array($_POST['besoins'])) {
    foreach (array_slice($_POST['besoins'], 0, 15) as $b) {
        $b = line($b, 80);
        if ($b !== '') $besoins[] = $b;
    }
}

if ($nom === '') {
    respond(false, 422, 'Merci d\'indiquer votre nom.', $wantsJson);
}
if ($telephone === '' && $email === '') {
    respond(false, 422, 'Merci d\'indiquer un téléphone ou un e-mail.', $wantsJson);
}
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 422, 'Adresse e-mail invalide.', $wantsJson);
}
if ($telephone !== '' && !preg_match('/^[0-9+().\s-]{6,30}$/', $telephone)) {
    respond(false, 422, 'Numéro de téléphone invalide.', $wantsJson);
}
if (!$consent) {
    respond(false, 422, 'Merci d\'accepter le traitement de vos données.', $wantsJson);
}

$subject = 'Nouvelle demande de devis — ' . $nom . ($metier !== '' ? ' (' . $metier . ')' : '');
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$na = static fn(string $v): string => $v !== '' ? $v : '—';
$body  = "NOUVELLE DEMANDE DE DEVIS\n";
$body .= "=========================\n\n";
$body .= "Nom        : " . $nom . "\n";
$body .= "Entreprise : " . $na($entreprise) . "\n";
$body .= "Métier     : " . $na($metier) . "\n";
$body .= "Téléphone  : " . $na($telephone) . "\n";
$body .= "E-mail     : " . $na($email) . "\n\n";
$body .= "Besoins    : " . ($besoins ? implode(', ', $besoins) : '—') . "\n";
$body .= "Formule    : " . $na($formule) . "\n";
$body .= "Abonnement : " . $na($abonnement) . "\n";
$body .= "Délai      : " . $na($delai) . "\n";
$body .= "Site actuel: " . $na($siteActuel) . "\n\n";
$body .= "Rendez-vous: " . $na($rdvMode) . " · " . $na($rdvMoment) . "\n\n";
$body .= "Message\n-------\n" . ($message !== '' ? $message : '—') . "\n\n";
$body .= "-- \nEnvoyé le " . date('d/m/Y à H:i') . " depuis le formulaire du site.\n";
$body  = wordwrap($body, 990, "\n", true);

$headers = [
    'From: WEBZLY <' . FROM . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
];
if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $headers[] = 'Reply-To: ' . $email;
}
// Final safety: no CR/LF may survive inside any header.
$headers = array_map(static fn(string $h): string => str_replace(["\r", "\n"], '', $h), $headers);

$sent = @mail($TO, $encodedSubject, $body, implode("\r\n", $headers), '-f' . FROM);

if (!$sent) {
    error_log('send.php: mail() a échoué');
    respond(false, 500, 'L\'envoi a échoué. Merci de réessayer ou de nous appeler.', $wantsJson);
}

$_SESSION['last_send'] = $now;
respond(true, 200, '', $wantsJson);
