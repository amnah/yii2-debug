<?php

namespace amnah\yii2\debug\controllers;

class UserController extends \yii\debug\controllers\UserController
{
    // this class is needed for user switching - it specifically checks
    // the namespace when creating a controller in `UserPanel::canSwitchUser()`
}
