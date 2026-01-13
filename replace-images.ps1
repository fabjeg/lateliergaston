# Script pour remplacer les images originales par les versions optimisées

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Remplacement des images optimisées" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si le dossier optimized existe
if (-not (Test-Path "src/assets/optimized")) {
    Write-Host "Erreur: Le dossier src/assets/optimized n'existe pas!" -ForegroundColor Red
    Write-Host "Veuillez d'abord exécuter: npm run optimize-images" -ForegroundColor Yellow
    exit 1
}

# Créer le dossier de backup
Write-Host "[1/3] Création du dossier de sauvegarde..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "src/assets/backup" | Out-Null

# Sauvegarder les images originales
Write-Host "[2/3] Sauvegarde des images originales..." -ForegroundColor Yellow
$jpgFiles = Get-ChildItem "src/assets/*.jpg" -File | Where-Object { $_.DirectoryName -notlike "*optimized*" -and $_.DirectoryName -notlike "*backup*" }
foreach ($file in $jpgFiles) {
    Copy-Item $file.FullName "src/assets/backup/" -Force
    Write-Host "  ✓ Sauvegardé: $($file.Name)" -ForegroundColor Gray
}

# Remplacer par les images optimisées
Write-Host "[3/3] Remplacement par les images optimisées..." -ForegroundColor Yellow
$optimizedFiles = Get-ChildItem "src/assets/optimized/*.jpg" -File
foreach ($file in $optimizedFiles) {
    Copy-Item $file.FullName "src/assets/" -Force
    Write-Host "  ✓ Remplacé: $($file.Name)" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Remplacement terminé avec succès! ✓" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines étapes:" -ForegroundColor Cyan
Write-Host "  1. Testez le site: npm run dev" -ForegroundColor White
Write-Host "  2. Vérifiez que tout fonctionne bien" -ForegroundColor White
Write-Host "  3. Déployez: git add . && git commit -m 'Images optimisées' && git push" -ForegroundColor White
Write-Host ""
Write-Host "Les images originales sont sauvegardées dans: src/assets/backup/" -ForegroundColor Gray
