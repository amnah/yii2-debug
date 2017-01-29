<?php
/* @var $this \yii\web\View */
/* @var $panels \yii\debug\Panel[] */
/* @var $tag string */
/* @var $currentTag string */
/* @var $position string */
/* @var $urls array */

use yii\helpers\Html;
use yii\helpers\Url;

$firstPanel = reset($panels);
$url = $firstPanel->getUrl();

?>
<div id="yii-debug-toolbar" class="yii-debug-toolbar yii-debug-toolbar_position_<?= $position ?>">
    <div class="yii-debug-toolbar__bar">
        <div class="yii-debug-toolbar__block yii-debug-toolbar__title">
            <a href="<?= Url::to(['index', 'tag' => $tag, 'currentTag' => $currentTag]) ?>" target="_blank">
                <img width="29" height="30" alt="" src="<?= \yii\debug\Module::getYiiLogo() ?>">
            </a>
        </div>

        <div class="yii-debug-toolbar__block yii-debug-toolbar__tag-selector">
            <?= Html::dropDownList("tag", $tag, $urls, ["id" => "yii-debug-toolbar__tag-selector"]) ?>
        </div>

        <?php foreach ($panels as $panel): ?>
            <?php
                /** @var string $summary */
                // add in panel id into div class
                $summary = $panel->getSummary();
                $summary = str_replace('<div class="yii-debug-toolbar__block', '<div class="yii-debug-toolbar__block yii-debug-toolbar__'.$panel->id, $summary);
                echo $summary;
            ?>
        <?php endforeach; ?>

        <a class="yii-debug-toolbar__external" href="#" target="_blank">
            <span class="yii-debug-toolbar__external-icon"></span>
        </a>

        <span class="yii-debug-toolbar__toggle">
            <span class="yii-debug-toolbar__toggle-icon"></span>
        </span>
    </div>

    <div class="yii-debug-toolbar__view">
        <iframe src="about:blank" frameborder="0"></iframe>
    </div>
</div>
