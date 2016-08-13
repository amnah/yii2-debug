<?php

namespace amnah\yii2\debug;

use Yii;
use yii\helpers\Html;
use yii\helpers\Url;
use yii\web\View;

class Module extends \yii\debug\Module
{
    /**
     * @inheritdoc
     */
    public $controllerNamespace = 'amnah\yii2\debug\controllers';

    /**
     * @inheritdoc
     */
    public $panels = [
        'profiling' => ['class' => 'amnah\yii2\debug\panels\ProfilingPanel'],
    ];

    /**
     * @inheritdoc
     */
    public $historySize = 100;

    /**
     * @var bool Whether or not to limit the dropdown to current request only (plus ajax)
     *           If false, it will show ALL requests stored (see [[historySize]])
     */
    public $limitToCurrentRequest = true;

    /**
     * @var string Current request separator. This will appear in the dropdown to separate
     *             the current and old requests. Used only if [[limitToCurrentRequest]] = false
     */
    public $currentRequestSeparator = " ----- Current Request Above ----- ";

    /**
     * Override renderToolbar() function so we can use our own assets
     * @inheritdoc
     */
    public function renderToolbar($event)
    {
        if (!$this->checkAccess() || Yii::$app->getRequest()->getIsAjax()) {
            return;
        }

        $baseDebugUrl = Url::toRoute(['/' . $this->id . '/default/toolbar']);
        $tag = $this->logTarget->tag;
        echo '<div id="yii-debug-toolbar" data-url="' . Html::encode($baseDebugUrl) . '" style="display:none" class="yii-debug-toolbar-bottom"></div>';
        /* @var $view View */
        $view = $event->sender;

        // echo is used in order to support cases where asset manager is not available
        echo '<style>' . $view->renderPhpFile(__DIR__ . '/assets/toolbar.css') . '</style>';
        echo '<script>' . $view->renderPhpFile(__DIR__ . '/assets/toolbar.js', compact('baseDebugUrl', 'tag')) . '</script>';
    }

    /**
     * @inheritdoc
     */
    public function bootstrap($app)
    {
        parent::bootstrap($app);

        // override the log target with ours
        $this->logTarget = Yii::$app->getLog()->targets['debug'] = new LogTarget($this);
    }
}