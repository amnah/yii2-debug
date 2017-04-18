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
     * @var string Current request separator. This will appear in the dropdown to separate
     *             the current and old requests
     */
    public $currentRequestSeparator = " ----- Current Request Above ----- ";

    /**
     * @var bool Include assets (toolbar.css and toolbar.js) into html. If you prefer,
     *           you can copy those files into the web folder and include them directly
     */
    public $includeAssets = true;

    /**
     * Override renderToolbar() function so we can use our own assets
     * @inheritdoc
     */
    public function renderToolbar($event = null)
    {
        if (!$this->checkAccess() || Yii::$app->getRequest()->getIsAjax()) {
            return;
        }

        $baseDebugUrl = Url::toRoute(['/' . $this->id . '/default/toolbar']);
        $baseDebugUrl = Html::encode($baseDebugUrl);
        $currentTag = $this->logTarget->tag;
        echo "<div id='yii-debug-toolbar' data-url='$baseDebugUrl' style='display:none' class='yii-debug-toolbar-bottom'></div>";
        echo "<script type='text/javascript'>window.yii2debugBaseDebugUrl = '$baseDebugUrl';window.yii2debugCurrentTag = '$currentTag';</script>";

        if ($this->includeAssets) {
            /* @var $view View */
            $view = isset($event->sender) ? $event->sender : new View();
            echo '<style>' . $view->renderPhpFile(__DIR__ . '/assets/toolbar.css') . '</style>';
            echo '<script>' . $view->renderPhpFile(__DIR__ . '/assets/toolbar.js') . '</script>';
        }
    }

    /**
     * @inheritdoc
     */
    public function bootstrap($app)
    {
        parent::bootstrap($app);

        // override the log target with ours
        $this->logTarget = $app->getLog()->targets['debug'] = new LogTarget($this);
    }
}